# -*- coding: utf-8 -*-
from persistent.mapping import PersistentMapping

import requests
import re
from bs4 import BeautifulSoup
import json
from dateutil.parser import parse
from datetime import datetime

pkpstatus_2_no = {
    "bo": 0,
    "m5": 5,
    "m10": 10,
    "mw": 999
}


class TrainsCollection(PersistentMapping):

    def __init__(self, trains=None):
        self.trains = []
        if trains is not None:
            self.trains.extend(trains)
        self._get_positions()
        self._updated = datetime.min

    def add_train(self, train):
        self.trains.append(train)

    @property
    def geojson(self):
        return self.geodict

    @property
    def geodict(self):
        self._update()
        ret_dict = {
            "type": "FeatureCollection",
            "features": [x.geodict for x in self.trains]
        }
        return ret_dict

    def _update(self):
        if (datetime.utcnow() - self._updated).total_seconds() > 60:
            print("Updateing!")
            self.trains = []
            self._get_positions()

    def _get_positions(self, url="http://82.160.42.14/opoznienia/"):
        res = requests.get(url)
        if res.status_code != 200:
            return None
        content = res.text

        soup = BeautifulSoup(content)
        # soup = BeautifulSoup(open("pkp.html", "r").read())
        trs = soup.find_all("tr", id=re.compile("tabela-n\d+"))
        for tr in trs:
            tds = tr.find_all("td")
            if(len(tds) >= 5):
                gurl = tds[0].a['href']
                pnumber = tds[0].a.text.strip()
                dest = tds[1].text.strip()
                ncity = tds[3].text.strip()
                status_text = tds[2].text.strip()
                status = " ".join(tds[2].get('class', [])).strip()
                status = pkpstatus_2_no.get(status, -1)
                act_date = tds[4].text
                position = re.search("\@(\d+\.\d+,\d+\.\d+)\&", gurl)
                position = [float(x) for x in position.groups()[0].split(",")]
                position.reverse()

                t = Train(position, pnumber, dest, status, ncity, act_date)
                self.trains.append(t)
        self._updated = datetime.utcnow()


class Train(object):

    def __init__(self, position=None, number=None,
                 dest=None, status=None, nearest_city=None,
                 act_date=None):
        self.position = position
        self.number = number
        self.path = dest
        self.status = status
        self.nearest_city = nearest_city
        self.date = parse(act_date)
        self.positions = {act_date: (self.position, nearest_city)}

        pass

    def __repr__(self):
        return '<%s %s %s %s>' % (
            self.__class__.__name__, self.number, self.position, self.date)

    def add_position(self, date, position, nearest_city=None):
        self.positions[date] = (position, nearest_city)

    @property
    def geojson(self):
        return json.dumps(self.geodict)

    @property
    def geodict(self):
        position = [10, 10]
        ret_dict = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": self.position
            },
            "properties": {
                "number": self.number,
                "path": self.path.encode('utf-8'),
                "status": self.status,
                "nearest_city": self.nearest_city.encode('utf-8'),
                "date": self.date.isoformat()
                #"date": datetime.now().isoformat()
            }
        }
        return ret_dict


# class MyModel(PersistentMapping):
#     __parent__ = __name__ = None
def appmaker(zodb_root):
    if not 'pkp' in zodb_root:
        pkp = TrainsCollection()
        zodb_root['pkp'] = pkp
        import transaction
        transaction.commit()
    return zodb_root['pkp']
