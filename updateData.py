import requests
import time
import unicodedata
from pymongo import MongoClient


def getInfo():
    try:
        print "request started..."
        req = requests.get(newUrl).text
        print "111"
        content = req.split(',')
        print "222"
        name = content[0].split("\"")[1]
        print name
        print "333"
        open = float(content[1])
        preValue = float(content[2])
        close = float(content[3])
        high = float(content[4])
        low = float(content[5])
        vol = float(content[9])
        dateArr = str(content[30]).split('-')
        date = dateArr[0] + "/" + dateArr[1] + "/" + dateArr[2]
        if(vol == 0):
            return

        obj = {
            "open": open,
            "close": close,
            "high": high,
            "low": low,
            "vol": vol,
            "date": date,
            "rate": round((close - preValue) * 100 / preValue, 2)
        }
        result = db.stock.find_one({
            "code": stockCode
        })
        isUpdated = False

        for d in result["data"]:
            if(d["date"] == date):
                isUpdated = True
                print "already updated"
                break
        if not isUpdated:
            db.stock.update_one({
                "code": stockCode
            }, {
                "$push": {
                    "data": obj
                }
            })
            print "update success"

    except:
        print "Error: unable to fecth stock data"
        print "another try"
        getInfo()


client = MongoClient("mongodb://localhost:27017")
url = "http://hq.sinajs.cn/list="
db = client.stock
cursor = db.stock.find({}, {"code": 1})
print "start fetching data"
for doc in cursor:
    stockCode = str(doc["code"])
    print stockCode
    newStockCode = ''
    if(stockCode[0] == '6'):
        newStockCode = 'sh' + stockCode
    else:
        newStockCode = 'sz' + stockCode
    newUrl = url + newStockCode
    getInfo()
print "updating ended"
# need to fix
# 1. unique index
# 2. add new stock
