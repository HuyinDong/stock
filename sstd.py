from pymongo import MongoClient
import datetime

# calculate average price based on day and current date


def calculateMA(period, deadline, arr):
    length = len(arr)
    if period + deadline > length or length < 30:
        return -1
    aggregate = 0
    for ele in arr[(length - period - deadline):(length - deadline)]:
        aggregate = aggregate + ele["close"]
    return round(aggregate / period, 2)

# is stock zhangting


def isZhangting(period, arr):
    i = 0
    length = len(arr)
    start = length - period
    if start < 0:
        return False
    for ele in arr[start:-1]:
        result = (arr[start]["close"] - arr[start - 1]
                  ["close"]) / arr[start - 1]["close"]
        start += 1
        if result > 0.095:
            return True
    return False


client = MongoClient("mongodb://localhost:27017")
db = client.stock
cursor = db.stock.find({})
stocks = []


currentSh = db.indexes.find_one({"code": "sh000001"})
# get latest date
print currentSh
today = currentSh["data"].pop()["date"]
print today

for doc in cursor:
    stockCode = str(doc["code"])
    data = doc["data"]
    if len(data) == 0:
        continue
    # calculate latest 8 days average price
    ma8 = calculateMA(8, 0, data)
    # calculate latest 13 days average price
    ma13 = calculateMA(13, 0, data)
    # calculate latest 21 days average price
    ma21 = calculateMA(21, 0, data)

    # calculate 8 days average price 5 days ago
    ma8_5 = calculateMA(8, 4, data)
    # calculate latest 13 days average price 5 days ago
    ma13_5 = calculateMA(13, 4, data)
    # calculate latest 21 days average price 5 days ago
    ma21_5 = calculateMA(21, 4, data)

    # calculate 8 days average price 8 days ago
    ma8_8 = calculateMA(8, 7, data)
    # calculate 13 days average price 8 days ago
    ma13_8 = calculateMA(13, 7, data)
    # calculate 21 days average price 8 days ago
    ma21_8 = calculateMA(21, 7, data)

    # is stock at the trend of going up
    isShangsheng = ma8 > ma13 and ma13 > ma21 and ma8_5 > ma13_5 and ma13_5 > ma21_5 and ma8_8 > ma13_8 and ma8_8 > ma21_8
    last = data[len(data) - 1]
    date = last["date"]
    # the volumn should be higher than 1000 million
    isVol = last["vol"] > 100000000

    # the stock should not be stopped
    isNotTingpai = date == today
    print isNotTingpai
    # if stockCode == "002302":
    #     print isZhangting(18,data)
    #     print isShangsheng
    if isShangsheng and isVol and isZhangting(13, data) and isNotTingpai:
        stocks.append(stockCode)


obj = {
    "date": date,
    "data": stocks
}

# update or insert new one
result = db.model.find_one({"type": "sstd"})
if result is None:
    db.model.insert_one({
        "type": "sstd",
        "stocks": [obj]
    })
else:
    # check if sstd has been run
    latest = result["stocks"].pop()
    if latest["date"] != date:
        db.model.update_one({
            "type": "sstd"
        }, {
            "$push": {
                "stocks": obj
            }
        })

# need to fix
# 1. unique index


# doc = cursor[1]
# data = doc["data"]
# print doc["name"]
# ma8 = calculateMA(8,0,data)
# ma13 = calculateMA(13,0,data)
# ma21 = calculateMA(21,0,data)
# print ma8
# print ma13
# print ma21
#
# print "============"
# ma8_3 = calculateMA(8,3,data)
# ma13_3 = calculateMA(13,3,data)
# ma21_3 = calculateMA(21,3,data)
# print ma8_3
# print ma13_3
# print ma21_3
