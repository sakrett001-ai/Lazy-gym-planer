import {useEffect,useRef,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Helmet} from 'react-helmet';
import {getPlannerDocument, type OutputType} from '../endpoints/planner-document_GET.schema';
import styles from './Planner.module.css';

const adapter = `<script>
document.addEventListener('DOMContentLoaded',function(){
  var target=new URL(document.referrer||document.baseURI).origin;
  var link=document.querySelector('a.lang');
  if(link)link.addEventListener('click',function(event){event.preventDefault();parent.postMessage({type:'lazy-gym:language',lang:window.PODHOD_LANG==='ru'?'en':'ru'},target);});
  parent.postMessage({type:'lazy-gym:ready',version:window.PODHOD_VERSION,lang:window.PODHOD_LANG},target);
});
</script>`;

export default function Planner({lang='ru',className=''}:{lang?:'ru'|'en';className?:string}) {
  const frame=useRef<HTMLIFrameElement>(null);
  const navigate=useNavigate();
  const [release,setRelease]=useState<OutputType|null>(null);
  const [error,setError]=useState('');
  const [attempt,setAttempt]=useState(0);
  const [ready,setReady]=useState(false);
  const en=lang==='en';
  useEffect(()=>{
    const controller=new AbortController();
    setRelease(null);setError('');setReady(false);
    getPlannerDocument(lang,controller.signal).then(setRelease).catch(e=>{if(!controller.signal.aborted)setError(e instanceof Error?e.message:String(e));});
    return ()=>controller.abort();
  },[lang,attempt]);
  useEffect(()=>{
    const receive=(event:MessageEvent)=>{
      if(event.source!==frame.current?.contentWindow || event.origin!==window.location.origin)return;
      if(event.data?.type==='lazy-gym:ready' && event.data.lang===lang && event.data.version===release?.version)setReady(true);
      if(event.data?.type==='lazy-gym:language' && (event.data.lang==='ru'||event.data.lang==='en'))navigate(event.data.lang==='en'?'/en':'/');
    };
    window.addEventListener('message',receive);
    return ()=>window.removeEventListener('message',receive);
  },[lang,navigate,release]);
  useEffect(()=>{
    if(!release||ready)return;
    const timer=setTimeout(()=>setError(en?'The planner did not start. Please retry.':'Планировщик не запустился. Повторите загрузку.'),20000);
    return ()=>clearTimeout(timer);
  },[release,ready,en]);
  const document=release?.html.replace(/<\/body>\s*<\/html>\s*$/i,`${adapter}</body></html>`);
  return <div className={`${styles.shell} ${className}`} data-planner-source={release?.sourceCommit} data-planner-version={release?.version}>
    <Helmet><html lang={lang}/><title>Lazy Gym Planner</title>
      <meta name="description" content={en?'A workout planner with an exercise atlas and weight log.':'Планировщик тренировок под ваш зал и цель, атлас движений и журнал весов.'}/>
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
      <meta name="theme-color" content="#ECEFF3"/><link rel="manifest" href="/manifest.json"/>
    </Helmet>
    {document&&<iframe ref={frame} className={styles.frame} title={en?'Workout planner':'Планировщик тренировок'} srcDoc={document} allow="fullscreen"/>}
    {(!ready||error)&&<div className={styles.message} role={error?'alert':'status'}>
      <h1 className={styles.logo}>Lazy<span>Gym</span>Planner</h1>
      {error?<><p>{error}</p><button className={styles.button} onClick={()=>setAttempt(a=>a+1)}>{en?'Retry':'Повторить'}</button></>:<><div className={styles.progress} aria-hidden="true"/><p>{en?'Loading your workout planner…':'Загружаем планировщик тренировок…'}</p></>}
    </div>}
  </div>;
}
