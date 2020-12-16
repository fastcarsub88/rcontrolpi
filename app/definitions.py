door1_open     = [0,1]
door1_close    = [0,2]
sm_door1_open     = [0,3]
sm_door1_close    = [0,4]
pres_AO        = [0,1]
move_time      = 60 #seconds

door_dict = {
"11open": door1_open,
"11close": door1_close,
"12open": sm_door1_open,
"12close": sm_door1_close,
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
"12close",
"12open",
"11close",
"11open",
]
