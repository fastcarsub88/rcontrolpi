door1_open     = [0,7]
door1_close    = [0,5]
door2_open     = [0,2]
door2_close    = [0,4]
sm_door1_open  = [0,8]
sm_door1_close = [0,6]
sm_door2_open  = [0,1]
sm_door2_close = [0,3]
pres_AO        = [0,1]
move_time      = 60 #seconds

door_dict = {
"11open": door1_open,
"11close": door1_close,
"21open": door2_open,
"21close": door2_close,
"12open": sm_door1_open,
"12close": sm_door1_close,
"22open": sm_door2_open,
"22close": sm_door2_close
}

wind_dir_dict = {
0  : "N",
45 : "NE",
90 : "E",
135: "SE",
180: "S",
225: "SW",
270: "W",
315: "NW",
360: "N"
}

door_arr = [
"12open",
"11open",
"12close",
"11close",
"21close",
"22close",
"21open",
"22open"
]
