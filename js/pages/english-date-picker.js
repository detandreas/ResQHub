/* English-only calendar with a single 24-hour time selector. External JS. */
'use strict';
const EnglishDatePicker = (() => {
  let selectedValue = '';
  let trigger = null;
  function init() {
    const $ = id => document.getElementById(id);
    trigger = $('slotInput');
    const panel = $('slot-picker');
    if (!trigger || !panel) return;
    const calendar = $('picker-calendar');
    const monthLabel = $('picker-month');
    const time = $('picker-time');
    const prev = $('picker-prev');
    const pad = n => String(n).padStart(2, '0');
    const key = (y,m,d) => `${y}-${pad(m+1)}-${pad(d)}`;
    const today = () => new Date();
    let year = today().getFullYear();
    let month = today().getMonth();
    let day = today().getDate();
    for (let h=0; h<24; h++) {
      for (let m=0; m<60; m+=30) {
        const value = `${pad(h)}:${pad(m)}`;
        time.add(new Option(value, value));
      }
    }
    function pickInitialTime() {
      const n = today();
      const minutes = n.getHours()*60+n.getMinutes()+30;
      const next = Math.ceil(minutes/30)*30;
      time.value = `${pad(Math.floor(next/60)%24)}:${pad(next%60)}`;
    }
    pickInitialTime();
    function render() {
      const n = today();
      const earliest = key(n.getFullYear(),n.getMonth(),n.getDate());
      prev.disabled = year===n.getFullYear() && month===n.getMonth();
      monthLabel.textContent = new Intl.DateTimeFormat('en-GB',{month:'long',year:'numeric'}).format(new Date(year,month,1));
      calendar.replaceChildren();
      ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].forEach(name => {
        const el=document.createElement('span');
        el.className='english-picker__weekday'; el.textContent=name; calendar.append(el);
      });
      const offset=(new Date(year,month,1).getDay()+6)%7;
      for(let i=0;i<offset;i++) calendar.append(document.createElement('span'));
      for(let d=1;d<=new Date(year,month+1,0).getDate();d++) {
        const b=document.createElement('button');
        b.type='button'; b.className='english-picker__day'; b.textContent=d;
        b.disabled=key(year,month,d)<earliest;
        b.setAttribute('aria-label',new Intl.DateTimeFormat('en-GB',{dateStyle:'full'}).format(new Date(year,month,d)));
        if(day===d){b.classList.add('english-picker__day--selected');b.setAttribute('aria-pressed','true');}
        b.addEventListener('click',()=>{day=d;render();}); calendar.append(b);
      }
    }
    function close() { panel.hidden=true; trigger.setAttribute('aria-expanded','false'); }
    function open() {
      if (selectedValue) {
        const d=new Date(selectedValue);
        if (d.getTime()>Date.now()) {
          year=d.getFullYear();month=d.getMonth();day=d.getDate();
          time.value=`${pad(d.getHours())}:${pad(d.getMinutes())}`;
        }
      } else {
        const n=today();year=n.getFullYear();month=n.getMonth();day=n.getDate();pickInitialTime();
      }
      panel.hidden=false;trigger.setAttribute('aria-expanded','true');render();
    }
    trigger.addEventListener('click',()=>{if(panel.hidden)open();else close();});
    prev.addEventListener('click',()=>{const n=today();if(year===n.getFullYear()&&month===n.getMonth())return;month--;if(month<0){month=11;year--;}day=null;render();});
    $('picker-next').addEventListener('click',()=>{month++;if(month>11){month=0;year++;}day=null;render();});
    $('picker-cancel').addEventListener('click',()=>{close();trigger.focus();});
    $('picker-apply').addEventListener('click',()=>{
      if(day===null){UI.notice('Select a date first.','error','form-message');return;}
      const v=`${key(year,month,day)}T${time.value}`;
      if(!Number.isFinite(new Date(v).getTime())||new Date(v).getTime()<=Date.now()){
        UI.notice('Choose a future date and time.','error','form-message');return;
      }
      selectedValue=v;
      trigger.textContent=new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(v));
      UI.clearNotice('form-message');close();trigger.focus();
    });
    document.addEventListener('pointerdown',e=>{if(!panel.hidden&&!e.target.closest('.english-picker'))close();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){close();trigger.focus();}});
    render();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  return {getValue:()=>selectedValue,clear:()=>{selectedValue='';if(trigger)trigger.textContent='Select date and time';}};
})();
