(() => {
 const form=document.getElementById('jobApplicationForm');if(!form)return;
 const status=document.getElementById('applicationStatus'),button=document.getElementById('applySubmit'),started=Date.now();
 const API='https://wfxuxrvygyzonkflpwoq.supabase.co/rest/v1/dfl_job_applications';
 const KEY='sb_publishable_e2h4t8AvCobzftt36UrDbw_NJGq8qlJ';
 const input=form.elements.phone;
 const resumeInput=form.elements.resume_file;
 const resumeInfo=document.getElementById('resumeFileInfo');
 const MAX_RESUME_BYTES=5*1024*1024;
 const BUCKET='dfl-job-resumes';
 const MIME_BY_EXTENSION={pdf:'application/pdf',jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'};
 function fileSpec(file){
  if(!file)return null;
  const extension=(file.name.split('.').pop()||'').toLowerCase();
  const mime=MIME_BY_EXTENSION[extension];
  if(!mime||file.size===0||file.size>MAX_RESUME_BYTES)throw new Error('Please choose a PDF, JPG, PNG, WebP, or DOCX resume no larger than 5 MB.');
  if(file.type&&file.type!==mime)throw new Error('The file type does not match its extension.');
  return {extension,mime};
 }
 async function checkSignature(file,extension){
  const bytes=new Uint8Array(await file.slice(0,16).arrayBuffer());
  const same=(offset,arr)=>arr.every((b,i)=>bytes[offset+i]===b);
  const valid= extension==='pdf'?same(0,[37,80,68,70,45]):
   extension==='jpg'||extension==='jpeg'?same(0,[255,216,255]):
   extension==='png'?same(0,[137,80,78,71,13,10,26,10]):
   extension==='webp'?same(0,[82,73,70,70])&&same(8,[87,69,66,80]):
   extension==='docx'?same(0,[80,75,3,4]):false;
  if(!valid)throw new Error('This file is not a valid '+extension.toUpperCase()+' file. Please choose another resume.');
 }
 resumeInput.addEventListener('change',()=>{
  try{const file=resumeInput.files?.[0];fileSpec(file);resumeInfo.textContent=file?file.name+' ('+(file.size/1024/1024).toFixed(2)+' MB)':'';}
  catch(err){resumeInput.value='';resumeInfo.textContent=err.message;}
 });
 async function uploadResume(file){
  const {extension,mime}=fileSpec(file);
  await checkSignature(file,extension);
  const path='resumes/'+crypto.randomUUID()+'.'+extension;
  const url='https://wfxuxrvygyzonkflpwoq.supabase.co/storage/v1/object/'+BUCKET+'/'+path;
  const response=await fetch(url,{method:'POST',headers:{apikey:KEY,'Content-Type':mime,'x-upsert':'false','cache-control':'3600'},body:file});
  if(!response.ok){const details=await response.json().catch(()=>({}));throw new Error('Resume upload failed ('+response.status+'): '+(details.message||details.error||'Unknown error'));}
  return path;
 }

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
   const resume=resumeInput.files?.[0];
   if(resume){
    status.textContent='Uploading your resume…';
    data.resume_path=await uploadResume(resume);
   }
   status.textContent='Submitting your application…';
   const response=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json',apikey:KEY,Prefer:'return=minimal'},body:JSON.stringify(data)});
   if(!response.ok){const detail=await response.json().catch(()=>({}));throw Error('Submission failed ('+response.status+'): '+(detail.message||detail.code||'Unknown error'));}
   form.hidden=true;document.querySelector('.form-heading').hidden=true;document.getElementById('applicationSuccess').hidden=false;document.getElementById('applicationSuccess').scrollIntoView({behavior:'smooth',block:'center'});
  }catch(error){console.error('Application submission failed',error);status.className='form-status error';status.textContent='We couldn’t submit your application right now. Please try again in a moment.';}
  finally{button.disabled=false;button.innerHTML='Submit Application <span aria-hidden="true">→</span>';}
 });
})();