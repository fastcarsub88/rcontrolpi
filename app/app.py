import cgi,json,threading,megaioind as m,relay8 as r
from time import sleep
from datetime import datetime
from definitions import *

def open_door(dnum,mv_tm):
    op_relay = door_dict[dnum+"open"]
    cl_relay = door_dict[dnum+"close"]
    def move():
        m.setRelay(cl_relay[0],cl_relay[1],0)
        sleep(0.1)
        m.setRelay(op_relay[0],op_relay[1],1)
        if mv_tm == 100:
            return
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
        if mv_tm == 100:
            return
        sleep(mv_tm)
        m.setRelay(cl_relay[0],cl_relay[1],0)
    thr = threading.Thread(target=move)
    thr.start()

def set_pressure(percent):
    pres = int(percent)
    if pres < 0 or pres > 100:
        raise Exception
    with open('data_file.json') as f:
        data_file = json.load(f)
    data_file['max_pres'] = float(pres)/10
    with open('data_file.json','w') as f:
         f.write(json.dumps(data_file))

def set_auto_man(bool):
    with open('data_file.json') as f:
        data_file = json.load(f)
    if data_file['auto'] != bool:
        data_file['auto'] = bool
        with open('data_file.json','w') as f:
             f.write(json.dumps(data_file))
        if bool == 0:
            m.setRelays(0,0)

def get_params():
    with open('data_file.json') as f:
        return f.read()

def get_status():
    r_stat = '{0:04b}'.format(m.getRelays(0))
    d = {}
    for i in range(len(door_arr)):
        d[door_arr[i]] = r_stat[i]
    res = {}
    res['d_stat'] = json.dumps(d)
    res['params'] = get_params()
    res['time'] = datetime.now().strftime('%H:%M')
    return json.dumps(res)

def put_params(jsn):
    o_prms = json.loads(get_params())
    n_prms = json.loads(jsn)
    for value in n_prms:
        n_val = n_prms[value]
        if value == "max_pres" or value == 'min_pres' or value == 'rain_pres':
            f_val = float(n_prms[value])
            if f_val > 100 or f_val < 0:
                raise Exception
            n_val = f_val/10
        o_prms[value] = n_val
    with open('data_file.json','w') as f:
         f.write(json.dumps(o_prms))

def func_caller(post):
    if "method" not in post:
        return '{"response":"error","error":"no method"}'
    method = post.getvalue('method')
    try:
        if method == 'move_door':
            op_cl = post.getvalue('dfunc')
            mv_tm = int(post.getvalue('mv_tm'))
            dnum = post.getvalue('dnum')
            set_auto_man(0)
            if op_cl == 'close':
                close_door(dnum,mv_tm)
            else:
                open_door(dnum,mv_tm)
        if method == 'set_pressure':
            pres = post.getvalue('percent')
            set_pressure(pres)
        if method == 'set_auto':
            auto = post.getvalue('auto')
            bool =  1 if auto == 'true' else 0
            set_auto_man(bool)
        if method == 'get_params':
            return get_params()
        if method == 'put_params':
            put_params(post.getvalue('params'))
        if method == 'get_status':
            return get_status()
        return '{"response":"ok"}'
    except Exception:
        return '{"response":"error","error":"Exception"}'


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
