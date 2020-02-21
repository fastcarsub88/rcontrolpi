door1_open  = [0,1]
door1_close = [0,2]
door2_open  = [0,3]
door2_close = [0,4]
sm_door1_open  = []
sm_door1_close = []
sm_door2_open  = []
sm_door2_close = []
door1_dir    = 1
move_time    = 60 #seconds
time_to_close = 10 #minutes
doors1_limit = 45.0 #deg F
doors2_limit = 30.0 #deg F
max_pressure = 80
low_pressure = 30

door_dict = {
"11open": door1_open,
"11close": door1_close,
"21open": door2_open,
"21close": door2_close
}

wind_dir = {
0  : "N",
45 : "NE",
90 : "E",
135: "SE",
180: "S",
225: "SW",
270: "W",
315: "NW"
}
#
# for value in wind_dir_dict:
#     if value < c_wind_dir:
#         continue
#     if (value - c_wind_dir) < 23:
#         wind_dir_str = wind_dir_dict[value]
#     else:
#         wind_dir_str = wind_dir_dict[(value-1)]
