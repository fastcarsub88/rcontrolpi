import requests,threading,json,requests,megaioind as m
from datetime import datetime
from time import sleep
from definitions import *

last_weather_check = 0

def open_door(dnum):
    op_relay = door_dict[dnum+"open"]
    cl_relay = door_dict[dnum+"close"]
    m.setRelay(cl_relay[0],cl_relay[1],0)
    sleep(0.1)
    m.setRelay(op_relay[0],op_relay[1],1)

def close_door(dnum):
    op_relay = door_dict[dnum+"open"]
    cl_relay = door_dict[dnum+"close"]
    m.setRelay(op_relay[0],op_relay[1],0)
    sleep(0.1)
    m.setRelay(cl_relay[0],cl_relay[1],1)

def get_conditions(data_file):
    w_data = requests.get("https://api.openweathermap.org/data/2.5/weather?zip=65078,us&appid=914fd2c984f8077049df587218d8579d&units=imperial")
    w_dict = json.loads(w_data.text)
    data_file['feels_like'] = w_dict['main']['feels_like']
    data_file['wind_speed'] = w_dict['wind']['speed']
    data_file['wind_dir'] = w_dict['wind']['deg']
    with open('data_file.json','w') as f:
         f.write(json.dumps(data_file))


while True:
    sleep(5)
    cr_tm = int(datetime.now().strftime('%H:%M').replace(":",''))
    with open('data_file.json') as f:
        data_file = json.load(f)
    if (cr_tm - last_weather_check) > 10:
        last_weather_check = cr_tm
        print('gettin conditions')
        get_conditions(data_file)
    if data_file['auto'] == 0:
        print('not auto')
        continue
    feels_like = data_file['feels_like']
    op_tm = data_file['open']
    cl_tm = data_file['close']
    if cr_tm > op_tm and cr_tm < cl_tm:
        print('open')
        if feels_like > doors2_limit:
            if feels_like < doors1_limit:
                door_to_move = 'small'
            else:
                door_to_move = 'main'
            print(door_to_move)
            open_door("11")
            sleep(0.01)
            open_door("21")
    else:
        print('close')
        close_door("11")
        sleep(0.01)
        close_door("21")
