import megaioind as m,json

with open('data_file.json') as d:
    f = json.load(d)
    print f['rain']
print m.getUOut(0,1)
