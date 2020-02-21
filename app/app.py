import cgi,json,threading,megaioind as m
from time import sleep
from definitions import *


def open_door(dnum,mv_tm):
    print(mv_tm)
    op_relay = door_dict[dnum+"open"]
    cl_relay = door_dict[dnum+"close"]
    def move():
        m.setRelay(cl_relay[0],cl_relay[1],0)
        sleep(0.1)
        m.setRelay(op_relay[0],op_relay[1],1)
        sleep(mv_tm)
        m.setRelay(op_relay[0],op_relay[1],0)
    thr = threading.Thread(target=move)
    thr.start()

def close_door(dnum,mv_tm):
    op_relay = door_dict[dnum+"open"]
    cl_relay = door_dict[dnum+"close"]
    def move():
        m.setRelay(op_relay[0],op_relay[1],0)
        sleep(0.1)
        m.setRelay(cl_relay[0],cl_relay[1],1)
        sleep(mv_tm)
        m.setRelay(cl_relay[0],cl_relay[1],0)
    thr = threading.Thread(target=move)
    thr.start()

def set_pressure(percent):
    with open('data_file.json') as f:
        data_file = json.load(f)
    data_file['air_pressure'] = percent
    with open('data_file.json','w') as f:
         f.write(json.dumps(data_file))

def set_auto_man(bool):
    with open('data_file.json') as f:
        data_file = json.load(f)
    data_file['auto'] = bool
    with open('data_file.json','w') as f:
         f.write(json.dumps(data_file))

def func_caller(post):
    if "method" not in post:
        return '{"response":"error","error":"no method"}'
    method = post.getvalue('method')
    if method == 'move_door':
        op_cl = post.getvalue('dfunc')
        mv_tm = float(post.getvalue('mv_tm'))
        dnum = post.getvalue('dnum')
        print('befor auot')
        set_auto_man(0)
        print('asfte')
        if op_cl == 'close':
            close_door(dnum,mv_tm)
        else:
            open_door(dnum,mv_tm)
    if method == 'set_pressure':
        pres = int(post.getvalue('percent'))
        if pres < 0 or pres > 100:
            raise Exception
        set_pressure(pres)
    if method == 'set_auto':
        auto = post.getvalue('auto')
        bool =  1 if auto == 'true' else 0
        set_auto_man(bool)
    return '{"response":"ok"}'
    # try:
    #
    # except Exception:
    #     return '{"response":"error","error":"Exception"}'


def application(env, start_response):
    if env['REQUEST_METHOD'] == 'POST':
        post_env = env.copy()
        post_env['QUERY_STRING'] = ''
        post = cgi.FieldStorage(
            fp=env['wsgi.input'],
            environ=post_env,
            keep_blank_values=True
        )
        response = func_caller(post)
    else:
        response = '{"error":"not allowed"}'
    start_response('200',[('Content-Type','text/html'),('Access-Control-Allow-Origin','*')])
    return[response]
