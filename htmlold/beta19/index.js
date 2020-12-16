var modal = document.getElementById('mdl_elem');
var parModel = document.getElementById('par_mdl_elem');
var setAutoBtn = document.getElementById('auto_btn');
var modalSlider = document.getElementById('amount_mv');
var modalBtn = document.getElementById('modal_btn');
var loader = document.getElementById('loader_elem');
var mdlSliderValue = document.getElementById('mdl_slider_value');
var modalSliderDiv = document.getElementById('mdl_sldr_div');
var parForm = document.forms.par_form;

modal.open = async function(func,dnum){
  if (func == 'set_pressure') {
    var title = "Set Pressure";
    modalBtn.innerText = 'Set';
    var data = await get_params();
    pres = data.max_pres*10;
    modalSlider.value = pres;
    mdlSliderValue.innerText = pres;
  }else if (func == 'set_auto') {
    var title = "Set Auto"
    modalSliderDiv.classList.add('no-display');
    modalBtn.innerText = (dnum == '0' ? "ON" : "OFF");
  } else {
    var title = (dnum[1] == "2" ? "Small" : "Main")+' Door '+dnum[0];
    modalBtn.innerText = 'Move';
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
  var f = new FormData();
  f.append('method',"get_params")
  var data = await send_data(f);
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
  this.classList.remove('no-display');
}
parModel.close = function () {this.classList.add('no-display')}
loader.show = function () {this.classList.remove('no-display')}
loader.hide = function () {setTimeout(()=>{this.classList.add('no-display')},500);}
document.getElementById('dbtn_area').onclick = (e) => {
  if (!e.target.dataset.dfunc) {return}
  var tgt_data = e.target.dataset;
  var dnum = tgt_data.dnum;
  var func = tgt_data.dfunc;
  modal.open(func,dnum);
}
document.getElementById('get_params_btn').onclick = () => parModel.open();
document.getElementById('par_mdl_btn').onclick = () => {
  var e = parForm.elements;
  var obj = {
    min_temp : parseInt(e.par_min_temp.value),
    sm_door_temp: parseInt(e.par_sm_door_temp.value),
    max_pres: parseInt(e.par_max_pres.value),
    min_pres: parseInt(e.par_min_pres.value),
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
  var f = new FormData();
  f.append('method','put_params');
  f.append('params',JSON.stringify(obj))
  send_data(f).then(() => parModel.close());
}
document.getElementById('clx1').onclick = () => parModel.close();
document.getElementById('clx2').onclick = () => modal.close();
document.addEventListener('visibilitychange',() => {
  if (document.visibilityState == 'hidden') {
    poll.pause();
  }else {
    poll.paused = false;
    poll.start();
  }
})
modalBtn.onclick = function () {
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
    var auto = (modal.dnum == '1' ? 'false' : 'true')
    fd.append('method','set_auto');
    fd.append('auto',auto);
  } else {
    fd.append('dnum',modal.dnum);
    fd.append('dfunc',modal.func);
    fd.append('mv_tm',modalSlider.value);
    fd.append('method',"move_door");
  }
  send_data(fd).then(()=>{modal.close();func()}).catch((e)=>alert('Error:'+e));
}
window.onclick = (e) => {
  if (e.target == modal){modal.close()}
  if (e.target == parModel) {parModel.close()}
}
modalSlider.oninput = function () {
  mdlSliderValue.innerText = this.value;
}
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
  loader.show();
  return fetch(
      window.location.href+'/api',
      {method: 'POST',body: request}
    )
    .then((response)=> {loader.hide();return response.json()})
    .catch(()=>{alert("Not connected to controller")})
}
async function get_params() {
  var f = new FormData();
  f.append("method","get_params");
  return send_data(f);
}
async function get_status() {
  var f = new FormData();
  f.append("method","get_status");
  return send_data(f);
}
async function get_conditions() {
  var status = await get_status();
  var cond = JSON.parse(status.params);
  var d_stat = JSON.parse(status.d_stat);
  document.getElementById('temp_elem').innerText = cond.feels_like;
  document.getElementById('wind_sp_elem').innerText = cond.wind_speed;
  document.getElementById('wind_dir_elem').innerText = cond.wind_dir;
  if (cond.auto == 1) {
    setAutoBtn.classList.add('btn_active');
    setAutoBtn.dataset.dnum = 1;
  }
  for (let [key, value] of Object.entries(d_stat)){
    var el = document.querySelector('button[name="'+key+'"]');
    if (value == '1') {
      el.classList.add("btn_active");
    }else {
      el.classList.remove('btn_active');
    }
  }

}
document.addEventListener('DOMContentLoaded',poll.start)
