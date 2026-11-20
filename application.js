(() => {
 const form=document.getElementById('jobApplicationForm');if(!form)return;
 const status=document.getElementById('applicationStatus'),button=document.getElementById('applySubmit'),started=Date.now();
 const API='https://wfxuxrvygyzonkflpwoq.supabase.co/rest/v1/dfl_job_applications';
 const KEY='sb_publishable_e2h4t8AvCobzftt36UrDbw_NJGq8qlJ';
 const input=form.elements.phone;
 function formatTen(d){if(d.length<=3)return '('+d;if(d.length<=6)return '('+d.slice(0,3)+') '+d.slice(3);return '('+d.slice(0,3)+') '+d.slice(3,6)+'-'+d.slice(6,10);}
 function formatPhone(value){const d=value.replace(/\D/g,'').slice(0,25);if(!d)return '';return d.length<=10?formatTen(d):'+'+d.slice(0,-10)+' '+formatTen(d.slice(-10));}
 input.addEventListener('input',()=>{const value=input.value,start=input.selectionStart??value.length,digits=value.slice(0,start).replace(/\D/g,'').length,next=formatPhone(value);input.value=next;if(document.activeElement===input){let p=0,seen=0;while(p<next.length&&seen<digits){if(/\d/.test(next[p]))seen++;p++;}input.setSelectionRange(start===value.length?next.length:p,start===value.length?next.length:p);}});
 input.addEventListener('blur',()=>{input.value=formatPhone(input.value);});
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(!form.reportValidity())return;if(form.elements.company_website.value||Date.now()-started<1200)return;
  const get=name=>form.elements[name].value.trim();const phone=get('phone');
  if(phone.replace(/\D/g,'').length<10){status.className='form-status error';status.textContent='Please enter a valid phone number.';input.focus();return;}
  const data={full_name:get('full_name'),email:get('email'),phone,city:get('city'),position:'General / Other',experience:get('experience'),start_availability:get('start_availability'),schedule:get('schedule'),message:get('message')||null,consent:true};
  button.disabled=true;button.textContent='Submitting…';status.className='form-status';status.textContent='Sending your application securely…';
  try{
   const response=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json',apikey:KEY,Prefer:'return=minimal'},body:JSON.stringify(data)});
   if(!response.ok){const detail=await response.json().catch(()=>({}));throw Error('Submission failed ('+response.status+'): '+(detail.message||detail.code||'Unknown error'));}
   form.hidden=true;document.querySelector('.form-heading').hidden=true;document.getElementById('applicationSuccess').hidden=false;document.getElementById('applicationSuccess').scrollIntoView({behavior:'smooth',block:'center'});
  }catch(error){console.error('Application submission failed',error);status.className='form-status error';status.textContent='We couldn’t submit your application right now. Please try again in a moment.';}
  finally{button.disabled=false;button.innerHTML='Submit Application <span aria-hidden="true">→</span>';}
 });
})();