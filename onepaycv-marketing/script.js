const weeks = [
  {n:1, title:"Честность и первые ссылки", sub:"SEO-фундамент", days:[
    ["Понедельник","Контент","Напишите пост в X и LinkedIn","Честный Build in Public: расскажите про 2 апвоута OnePayCV и обещание продвигать его 30 дней.",60],
    ["Вторник","Каталоги","Добавьте OnePayCV в 3 каталога","Indie Hackers, BetaList и AlternativeTo — первые вечные ссылки.",60],
    ["Среда","Код","Создайте пустую страницу блога","onepaycv.cc/blog или /guides — простой фундамент для будущего контента.",60],
    ["Четверг","Каталоги","Добавьте сайт еще в 3 каталога","Toolify.ai, Launching Next и Tiny Founders.",60],
    ["Пятница","Контент","Напишите первую статью","«Почему подписки на конструкторы резюме за $40 — это скам». Ключи: free resume builder, no subscription.",60],
    ["Суббота","Код-отдушина","Добавьте маленькую приятную фичу","Например: скачать тестовый шаблон в 1 клик без регистрации.",60],
    ["Воскресенье","Аналитика","Поставьте бесплатную аналитику","Plausible или Umami. 30 минут достаточно.",30]
  ]},
  {n:2, title:"Партизанский Reddit и микро-утилиты", sub:"Полезность вместо спама", days:[
    ["Понедельник","Reddit","Оставьте 3 полезных комментария","r/resumes и r/jobs: ищите subscription/scam и реально помогайте людям.",60],
    ["Вторник","Код","Начните микро-инструмент","onepaycv.cc/ats-verbs — список 100 сильных глаголов для резюме по категориям.",60],
    ["Среда","Reddit","Еще 3 осознанных комментария","Помогите с резюме в Reddit и естественно упомяните ATS-шаблоны.",60],
    ["Четверг","Код","Опубликуйте шпаргалку глаголов","Доведите страницу до готового состояния и выложите её.",60],
    ["Пятница","Контент","Пост в X","Расскажите про бесплатную шпаргалку глаголов и тегните #buildinpublic.",60],
    ["Суббота","Код-отдушина","Поиграйте с дизайном","Шрифты, dark mode или новая цветовая схема шаблона.",60],
    ["Воскресенье","Отдых","Посмотрите на графики трафика","Никаких задач. Просто посмотрите, что происходит.",0]
  ]},
  {n:3, title:"Страницы сравнения", sub:"Ловим теплый трафик", days:[
    ["Понедельник","Контент","Создайте comparison page","Например /alternative-to-zety. Честно сравните подписку и разовую оплату.",60],
    ["Вторник","Код","Сделайте калькулятор переплаты","Количество месяцев → сколько пользователь переплатит за подписку.",60],
    ["Среда","Reddit/Quora","Ответьте на вопросы","Ищите best alternative to Zety/Novoresume и давайте ссылку на сравнение.",60],
    ["Четверг","Код","Ускорьте сайт","Проверьте Google PageSpeed Insights и подтяните мобильную скорость.",60],
    ["Пятница","Контент","Пост-апдейт в X","Расскажите о результатах первых 2 недель и трафике из Reddit.",60],
    ["Суббота","Код-отдушина","Новый минималистичный шаблон","Например, вариант для академиков или дизайнеров.",60],
    ["Воскресенье","Аналитика","Проверьте поисковые запросы","Посмотрите, по каким ключевым словам OnePayCV начинает появляться в Google.",0]
  ]},
  {n:4, title:"Масштабирование", sub:"Удваиваем то, что работает", days:[
    ["Понедельник","Reddit","Проанализируйте канал","Если Reddit дал переходы — продолжайте. Если нет — попробуйте r/sideproject.",60],
    ["Вторник","Код","Добавьте скрытую ссылку на резюме","Красивое веб-резюме, которое можно отправить HR, с мягкой плашкой Made with OnePayCV.",60],
    ["Среда","Контент","Напишите гайд для Junior-разработчика","«Как составить резюме без опыта работы в 2026 году».",60],
    ["Четверг","Код","Доведите личный кабинет","Сделайте сохраненные резюме аккуратными и понятными.",60],
    ["Пятница","Контент","Финальный пост месяца","Итоги 30 дней: графики, цифры и даже 50 посетителей — это ваши 50 человек.",60],
    ["Суббота","Код-спринт","Масштабный код-спринт","Выбирайте любую фичу и кодьте в своё удовольствие.",60],
    ["Воскресенье","Код-спринт","Масштабный код-спринт","Продолжайте спринт или спокойно подведите итоги месяца.",60]
  ]}
];

const STORAGE="onepaycv-marketing-v1";
let state=JSON.parse(localStorage.getItem(STORAGE)||'{"done":{},"startDate":null}');

const $=s=>document.querySelector(s);
const dayKey=(w,d)=>`w${w}d${d}`;
const allDays=()=>weeks.flatMap((w,wi)=>w.days.map((d,di)=>({w:w.n,d:di+1,data:d,key:dayKey(w.n,di+1)})));
const completed=()=>allDays().filter(x=>state.done[x.key]).length;
const total=allDays().length;
const xp=()=>allDays().reduce((sum,x)=>sum+(state.done[x.key]?(x.data[4]||0):0),0);

function save(){localStorage.setItem(STORAGE,JSON.stringify(state))}
function currentDay(){
  // 30-day plan is tracked by actual calendar days once started.
  if(!state.startDate) return allDays()[0];
  const start=new Date(state.startDate+"T00:00:00");
  const now=new Date(); now.setHours(0,0,0,0);
  const idx=Math.max(0,Math.floor((now-start)/86400000));
  return allDays()[Math.min(idx,total-1)];
}
function streak(){
  const done=allDays().filter(x=>state.done[x.key]);
  if(!done.length)return 0;
  // streak means consecutive completed plan-days ending at the latest completed day
  const nums=done.map(x=>allDays().findIndex(y=>y.key===x.key)).sort((a,b)=>b-a);
  let s=1;
  for(let i=1;i<nums.length;i++){if(nums[i-1]-nums[i]===1)s++;else break}
  return s;
}
function render(){
  $("#completedCount").textContent=completed();
  $("#xp").textContent=xp();
  $("#level").textContent=Math.floor(xp()/250)+1;
  $("#streak").textContent=streak();
  $("#totalProgress").style.width=(completed()/total*100)+"%";

  const cur=currentDay();
  if(cur){
    $("#todayTitle").textContent=`Неделя ${cur.w} · ${cur.data[0]}`;
    $("#todayBadge").textContent=cur.data[1];
    $("#todayTask").textContent=cur.data[2]+" — "+cur.data[3];
    $("#todayComplete").textContent=state.done[cur.key]?"✓ Сегодня выполнено":"Отметить выполненным";
    $("#todayComplete").classList.toggle("done",!!state.done[cur.key]);
    $("#todayComplete").onclick=()=>toggle(cur.key,true);
  }

  $("#weeks").innerHTML=weeks.map(w=>{
    const done=w.days.filter((_,i)=>state.done[dayKey(w.n,i+1)]).length;
    return `<section class="week">
      <div class="week-head">
        <div><div class="week-title">Неделя ${w.n} · ${w.title}</div><div class="week-sub">${w.sub}</div></div>
        <div class="week-progress">${done}/${w.days.length}</div>
      </div>
      ${w.days.map((d,i)=>{
        const key=dayKey(w.n,i+1), is=!!state.done[key];
        return `<div class="day ${is?"completed":""}" data-key="${key}">
          <div class="check"></div>
          <div class="day-content">
            <div class="day-meta"><span class="day-name">${d[0]}</span><span class="type">${d[1]}</span></div>
            <div class="day-title">${d[2]}</div>
            <div class="day-desc">${d[3]}</div>
          </div>
          <div class="xp-label">${d[4]?`+${d[4]} XP`:"FREE"}</div>
        </div>`;
      }).join("")}
    </section>`
  }).join("");

  document.querySelectorAll(".day").forEach(el=>el.onclick=()=>toggle(el.dataset.key));
  renderBadges();
  renderMotivation();
}
function toggle(key, today=false){
  const was=!!state.done[key];
  if(was) delete state.done[key];
  else {state.done[key]=true;if(!state.startDate)state.startDate=new Date().toISOString().slice(0,10)}
  save();render();
  if(!was) toast(today?"Сегодняшний шаг закрыт ✦":"Задача выполнена ✦");
}
function renderMotivation(){
  const c=completed();
  const messages=[
    ["Начни с одного часа.","Тебе не нужно продвигать весь OnePayCV сегодня. Нужно только сделать сегодняшний шаг."],
    ["Один час — это достаточно.","Маркетинг становится проще, когда он превращается не в мечту, а в повторяемую привычку."],
    ["Ты строишь доказательства.","Каждая ссылка, статья и комментарий — маленький сигнал миру, что OnePayCV существует."],
    ["Не жди идеального трафика.","Сначала появляются 2 человека. Потом 5. Потом цифры, по которым уже можно принимать решения."],
    ["Продолжай, пока не появятся данные.","Твоя задача не угадать, что сработает. Твоя задача — достаточно долго экспериментировать."]
  ];
  const idx=Math.min(Math.floor(c/5),messages.length-1);
  $("#motivationTitle").textContent=messages[idx][0];
  $("#motivationText").textContent=messages[idx][1];
}
function renderBadges(){
  const c=completed(), s=streak(), p=c/total;
  const badges=[
    ["🌱","Первый шаг","Выполнить 1 задачу",c>=1],
    ["🔥","Серия","3 дня подряд",s>=3],
    ["🔗","Link Builder","6 задач",c>=6],
    ["✍️","Creator","10 задач",c>=10],
    ["📈","Momentum","50% плана",p>=.5],
    ["🚀","OnePayCV","Весь план",c===total],
    ["⭐","500 XP","Набрать 500 XP",xp()>=500],
    ["🏁","30 Days","Дойти до конца",c===total]
  ];
  $("#badges").innerHTML=badges.map(b=>`<div class="badge ${b[3]?"unlocked":""}">
    <span class="badge-icon">${b[0]}</span><strong>${b[1]}</strong><span>${b[2]}</span>
  </div>`).join("");
}
function toast(msg){
  const t=$("#toast");t.textContent=msg;t.classList.add("show");
  clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove("show"),1800);
}
$("#resetBtn").onclick=()=>{
  if(confirm("Сбросить весь прогресс?")){state={done:{},startDate:null};save();render();toast("Прогресс сброшен")}
};
render();
