import requests
import time
import unicodedata
from pymongo import MongoClient

# get stock info from url


def getInfo(stockCode, dbname):
    # stock name used in url
    newStockCode = ''
    if(stockCode[0] == '6'):
        newStockCode = 'sh' + stockCode
    elif((stockCode[0] == 's')):
        newStockCode = stockCode
    else:
        newStockCode = 'sz' + stockCode
    newUrl = url + newStockCode
    try:
        print "request started..."
        print newUrl
        req = requests.get(newUrl, timeout=2).text
        print "111"
        content = req.split(',')
        print "222"
        name = content[0].split("\"")[1]
        print "333"
        print content
        # parse info
        open = float(content[1])
        preValue = float(content[2])
        close = float(content[3])
        high = float(content[4])
        low = float(content[5])
        vol = float(content[9])
        dateArr = str(content[30]).split('-')
        # ger date
        date = dateArr[0] + "/" + dateArr[1] + "/" + dateArr[2]
        print date
        # if stopped, return
        if(vol == 0):
            return
        # object to save
        obj = {
            "open": open,
            "close": close,
            "high": high,
            "low": low,
            "vol": vol,
            "date": date,
            "rate": round((close - preValue) * 100 / preValue, 2)
        }

        # find stock based on code
        result = db[dbname].find_one({
            "code": stockCode
        })
        isUpdated = False
        if result is None:
            db[dbname].insert_one({
                "name": name,
                "code": stockCode,
                "data": [obj]
            })
        else:
            # check if stock is updated or not
            for d in result["data"]:
                if(d["date"] == date):
                    isUpdated = True
                    print "already updated"
                    break
            # if not updated, update stock info
            if not isUpdated:
                db[dbname].update_one({
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
        time.sleep(2)
        # if failed, try again
        getInfo(stockCode, dbname)


# database url
client = MongoClient("mongodb://localhost:27017")
# sina stock api url
url = "http://hq.sinajs.cn/list="
db = client.stock
# get all stock codes
cursor = db.stock.find({}, {"code": 1})
print "start fetching data"
# loop based on codes
for doc in cursor:
    stockCode = str(doc["code"])
    print stockCode
    getInfo(stockCode, "stock")

# update indexes
indexes = ['sh000001', 'sz399001', 'sz399006']
for stock in indexes:
    getInfo(stock, 'indexes')

print "updating ended"
# need to fix
# 1. unique index
# 2. add new stock
