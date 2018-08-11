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
    for ele in arr[start:length]:
        result = (arr[start]["close"] - arr[start - 1]
                  ["close"]) / arr[start - 1]["close"]
        start += 1
        if result > 0.095:
            return True
    return False

# is the price up or down


def isYangxian(period, num, arr):
    yinxian = 0
    length = len(arr)
    start = length - period
    if start < 0:
        return False
    for ele in arr[start:length]:
        if arr[start]["close"] < arr[start]["open"]:
            yinxian += 1
        start += 1
    if yinxian > num:
        return False
    return True


client = MongoClient("mongodb://localhost:27017")
db = client.stock
cursor = db.stock.find({})
stocks = []


currentSh = db.stock.find_one({"code": "sh000001"})
# get latest date
print currentSh
# if currentSh is None:
#    currentSh =
today = currentSh["data"].pop()["date"]
print today
#today = "2018/01/19"

for doc in cursor:
    stockCode = str(doc["code"])
    data = doc["data"]
    if len(data) == 0:
        continue

    # new model can be edited from here
    last = data[len(data) - 1]
    date = last["date"]
    # the volumn should be higher than 1000 million
    isVol = float(last["vol"]) > 100000000

    # the stock should not be stopped
    isNotTingpai = date == today
    # print date
    # print today
    # print isNotTingpai
    # if stockCode == "002302":
    #     print isZhangting(18,data)
    #     print isShangsheng
    if isYangxian(8, 2, data) and isVol and isZhangting(13, data) and isNotTingpai:
        stocks.append(stockCode)

obj = {
    "date": date,
    "data": stocks
}

# update or insert new one
# result = db.sstd.find_one({"type": "sstd"})
# if result is None:
db.nly.insert_one(obj)
# else:
#     # check if sstd has been run
#     latest = result["stocks"].pop()
#     if latest["date"] != date:
#         db.model.update_one({
#             "type": "sstd"
#         }, {
#             "$push": {
#                 "stocks": obj
#             }
#         })

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
