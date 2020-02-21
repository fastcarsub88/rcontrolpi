var modal = document.getElementById('mdl_elem');
var setAutoBtn = document.getElementById('auto_btn');
modal.open = function(func,dnum){
  var title = func+" Range Door "+dnum[0]+'-'+dnum[1];
  document.getElementById('model_title').innerText = title;
  this.func = func;
  this.dnum = dnum;
  this.classList.remove('no-display')
};
modal.close = function(){this.classList.add('no-display')};

document.getElementById('dbtn_area').onclick = (e) => {
  var tgt = e.target;
  var func = tgt.dataset.dfunc
  var dnum = tgt.dataset.dnum
  modal.open(func,dnum)
}
document.getElementById('dmove_btn').onclick = function () {
  var fd = new FormData();
  fd.append('method','move_door');
  fd.append('dnum',modal.dnum);
  fd.append('dfunc',modal.func);
  fd.append('mv_tm',document.getElementById('amount_mv').value);
  send_data(fd).then(()=>modal.close()).catch(()=>alert('Error'));
}
setAutoBtn.onclick = function () {
  var f = new FormData();
  f.append("auto",(this.classList.contains('auto_on') ? 'false' : "true"));
  f.append('method',"set_auto");
  send_data(f).then(() => setAutoBtn.classList.toggle('auto_on'));
}
window.onclick = (e) => {
  if (e.target == modal){
  modal.close()}
}

async function send_data(request) {
  return fetch(
      window.location.origin+'/api',
      {method: 'POST',body: request}
    )
    .then((response)=> {return response.json()})
    .catch(()=>{console.log('Network response was not ok')})
}
