var params;
var modal = document.getElementById('mdl_elem');
var parModel = document.getElementById('par_mdl_elem');
var stModal = document.getElementById('st_mdl_elem');
var setAutoBtn = document.getElementById('auto_btn');
var modalSlider = document.getElementById('amount_mv');
var modalBtn = document.getElementById('modal_btn');
var loader = document.getElementById('loader_elem');
var mdlFuncVl = document.getElementById('mdl_func_vl');
var modalSliderDiv = document.getElementById('mdl_sldr_div');
var parForm = document.forms.par_form;
var opStForm = document.forms.op_st_form;

modal.open = async function(func,dnum){
  if (func == 'set_pressure') {
    var title = "Set Pressure";
    modalBtn.innerText = 'Set';
    var data = await get_params();
    pres = data.max_pres*10;
    modalSlider.value = pres;
    mdlFuncVl.innerText = pres+"%";
    modalSlider.max = '100'
    modalSlider.OnMove = () => {
      mdlFuncVl.innerText = modalSlider.value+'%'
    }
  }
  if (func == 'set_auto') {
    var title = "Set Auto"
    modalSliderDiv.classList.add('no-display');
    modalBtn.innerText = (setAutoBtn.dataset.dnum == '0' ? "ON" : "OFF");
    modal.auto = (setAutoBtn.dataset.dnum == '0' ? "true" : "false");
  }
  if (func == 'open' || func == 'close'){
    var funcTl = func[0].toUpperCase()+func.substr(1);
    modalSlider.max = "100";
    modalSlider.OnMove = () => {
      if (modalSlider.value == 100) {
        mdlFuncVl.innerHTML = funcTl+" On";
      }else {
        mdlFuncVl.innerHTML = funcTl+" on for "+modalSlider.value+" sec.";
      }
    }
    modalSlider.OnMove();
    var title = (dnum[1] == "2" ? "Small" : "Main")+' Door '+dnum[0];
    modalBtn.innerText = funcTl;
  }
  document.getElementById('model_title').innerText = title;
  this.func = func;
  this.dnum = dnum;
  this.classList.remove('no-display')
};
modal.close = function(){
  modalSliderDiv.classList.remove('no-display');
  modal.func = '';
  this.classList.add('no-display');
};
parModel.open = async function () {
  var data = await get_params();
  parForm.par_chbx_op_tm.value = data.open_method;
  parForm.par_chbx_cl_tm.value = data.close_method;
  if (data.open_method == 'sun') {
    parForm.par_open_sn.value = data.open;
  }
  if (data.open_method == 'time') {
    parForm.par_open_tm.value = data.open;
  }
  if (data.close_method == 'sun') {
    parForm.par_close_sn.value = data.close;
  }
  if (data.close_method == 'time') {
    parForm.par_close_tm.value = data.close;
  }
  parForm.par_min_temp.value = data.min_temp;
  parForm.par_sm_door_temp.value = data.sm_door_temp;
  parForm.par_max_pres.value = data.max_pres*10;
  parForm.par_min_pres.value = data.min_pres*10;
  parForm.par_fst_close_tm.value = data.fst_close_tm;
  parForm.par_rain_pres.value = data.rain_pres*10;
  this.classList.remove('no-display');
}
parModel.close = function () {this.classList.add('no-display')}
stModal.open = function () {
  opStForm.open_state.value = params.open_state;
  this.classList.remove('no-display')
}
stModal.close = function () {this.classList.add('no-display')}
loader.show = function () {this.classList.remove('no-display')}
loader.hide = function () {this.classList.add('no-display')}
setAutoBtn.onclick = () => modal.open('set_auto');
document.getElementById('pres_btn').onclick = () => {modal.open('set_pressure')};
document.getElementById('op_st_btn').onclick = () => {stModal.open()};
document.getElementById('get_params_btn').onclick = () => parModel.open();
document.getElementById('dbtn_area').onclick = (e) => {
  if (!e.target.dataset.dfunc) {return}
  var tgt_data = e.target.dataset;
  var dnum = tgt_data.dnum;
  var func = tgt_data.dfunc;
  modal.open(func,dnum);
}
document.getElementById('par_mdl_btn').onclick = () => {
  var e = parForm.elements;
  var obj = {
    min_temp : parseInt(e.par_min_temp.value),
    sm_door_temp: parseInt(e.par_sm_door_temp.value),
    max_pres: parseInt(e.par_max_pres.value),
    min_pres: parseInt(e.par_min_pres.value),
    rain_pres: parseInt(e.par_rain_pres.value),
    fst_close_tm: parseInt(e.par_fst_close_tm.value)
  };
  if (e.par_chbx_op_tm.value == 'time'){
    if (e.par_open_tm.value.length !== 5) {
      alert("You need to fill out open time");
      return;
    }else {
      obj.open_method = 'time';
      obj.open = e.par_open_tm.value;
    }
  }
  if (e.par_chbx_op_tm.value == 'sun') {
    obj.open_method = 'sun';
    obj.open = e.par_open_sn.value;
  }
  if (e.par_chbx_cl_tm.value == 'time'){
    if (e.par_close_tm.value.length !== 5) {
      alert("You need to fill out close time");
      return;
    }else {
      obj.close_method = 'time';
      obj.close = e.par_close_tm.value;
    }
  }
  if (e.par_chbx_cl_tm.value == 'sun') {
    obj.close_method = 'sun';
    obj.close = e.par_close_sn.value;
  }
  put_params(obj);
}
document.getElementById('st_modal_btn').onclick = () => {
  var d = {open_state : opStForm.open_state.value};
  put_params(d).then(stModal.close());
}
document.getElementById('clx1').onclick = () => parModel.close();
document.getElementById('clx2').onclick = () => modal.close();
document.getElementById('clx3').onclick = () => stModal.close();
document.addEventListener('visibilitychange',() => {
  if (document.visibilityState == 'hidden') {
    poll.pause();
  }else {
    poll.paused = false;
    poll.start();
  }
})
modalBtn.onclick = async function () {
  var func = ()=>{};
  var fd = new FormData();
  if (modal.func == 'set_pressure') {
    fd.append('percent',modalSlider.value);
    fd.append('method','set_pressure')
  }else if (modal.func == 'set_auto') {
    var func = function () {
      setAutoBtn.classList.toggle('btn_active');
      setAutoBtn.dataset.dnum = (setAutoBtn.dataset.dnum == '1' ? '0' : '1')
    }
    var auto = modal.auto;
    fd.append('method','set_auto');
    fd.append('auto',auto);
  } else {
    fd.append('dnum',modal.dnum);
    fd.append('dfunc',modal.func);
    fd.append('mv_tm',modalSlider.value);
    fd.append('method',"move_door");
  }
  loader.show();
  await send_data(fd).then(() => {
    modal.close();
    loader.hide();
    func();
  });
  setTimeout(() => get_conditions(),500);
}
window.onclick = (e) => {
  if (e.target == modal){modal.close()}
  if (e.target == parModel) {parModel.close()}
}
modalSlider.oninput = function () {this.OnMove()}
var poll = {
  paused: false,
  start: async function () {
    if (poll.paused) {return}
      await get_conditions();
      poll.timer = setTimeout(poll.start,10000);
    },
  pause: () => {
    poll.paused = true;
    clearTimeout(poll.timer);
  }
}
async function send_data(request) {
  return fetch(
      window.location.href+'/api',
      {method: 'POST',body: request}
    )
    .then((response)=> {return response.json()})
    .catch(()=>{alert("Not connected to controller")});
}
async function get_params() {
  loader.show();
  var f = new FormData();
  f.append("method","get_params");
  return send_data(f).then(loader.hide());
}
async function put_params(obj) {
  loader.show();
  var f = new FormData();
  f.append('method','put_params');
  f.append('params',JSON.stringify(obj))
  send_data(f).then(() => {parModel.close();loader.hide()});
}
async function get_status() {
  var f = new FormData();
  f.append("method","get_status");
  return send_data(f);
}
async function get_conditions() {
  var status = await get_status();
  params = JSON.parse(status.params);
  var d_stat = JSON.parse(status.d_stat);
  document.getElementById('temp_elem').innerText = params.feels_like;
  document.getElementById('wind_sp_elem').innerText = params.wind_speed;
  document.getElementById('wind_dir_elem').innerText = params.wind_dir;
  document.getElementById('rain_elem').innerText = (params.rain == 'true' ? "Yes": "No");
  document.getElementById('time_elem').innerText = status.time;
  if (params.auto == 1) {
    setAutoBtn.classList.add('btn_active');
    setAutoBtn.dataset.dnum = '1';
  }
  for (let [key, value] of Object.entries(d_stat)){
    var el = document.querySelector('button[name="'+key+'"]');
    if (value == '1') {
      el.classList.add("btn_active");
    }else {
      el.classList.remove('btn_active');
    }
  }
  var d = new Date();
  document.getElementById('last_time').innerText = d.toLocaleTimeString();
}
document.addEventListener('DOMContentLoaded',poll.start)
