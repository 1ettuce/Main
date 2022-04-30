Jsoup = org.jsoup.Jsoup

function url(link) {
  return encodeURIComponent(link);
}

function response(room, msg, sender, isGroupChat, replier, ImageDB, packageName, threadId) {
  msg = msg.trim();
  room = room.trim();
  sender = sender.trim().replace("~#~", "");
  if (!['건전한 아이들', 'Test_Room_1', 'Test_Room_2', 'Test_Room_3', 'Noti_Room'].includes(room)) return;
  var Certified = ['이상수'].includes(sender);
  var Meal_Noti_Room = '건전한 아이들';
  if (msg.indexOf("=맞춤법") == 0) {
    var 맞춤법 = Utils.getWebText("https://m.search.naver.com/p/csearch/ocontent/util/SpellerProxy?_callback=jQuery112409480582739631525_1546088820574&q=" + encodeURIComponent(msg.slice(4).trim()) + "&where=nexearch&color_blindness=0&_=1546088820582").split("notag_html\":\"")[1].split("\"")[0];
    replier.reply(msg.slice(4).trim() + "\n⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼\n" + 맞춤법);
  }
  if (msg.startsWith("=룰렛")) {
    replier.reply(msg.slice(3).split(",")[Math.floor(Math.random() * msg.slice(3).split(",").length)].trim());
  }
  if (msg.indexOf("=로마자") == 0) {
    try {
      var roma = Utils.getWebText("http://roman.cs.pusan.ac.kr/result_all.aspx?input=" + url(msg.slice(4).trim())).split("<span id=\"outputRMNormal\">")[1].split("</span>")[0];
    } catch (e) {
      replier.reply("오류 : " + e.name + " " + e.message);
      return;
    }
    replier.reply(msg.slice(4).trim() + "\n⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼\n" + roma);
  }
  if (msg.startsWith('=이름')) {
    try {
      var get_name = JSON.parse(Jsoup.connect('https://koreanname.me/api/name/' + url(msg.slice(3).trim())).ignoreContentType(true).execute().body())
      replier.reply(msg.slice(3).trim() + '은(는) ' + get_name['rank']['count'] + '명 있으며,\n남자는 ' + get_name['rank']['male']['count'] + '명, 여자는 ' + get_name['rank']['female']['count'] + '명이 사용중입니다.')
    } catch (e) {
      replier.reply('오류 : 예상치 못한 오류가 발생했습니다.\n\n다음에 다시 시도해주세요.')
    }
  }

  if (msg.startsWith('meal.')) {
    try {
      var Meal_Pre_Date1 = new Date();
      var Meal_Pre_Date2 = String(Meal_Pre_Date1.getMonth() + 1);
      var Meal_Pre_Date3 = String(Meal_Pre_Date1.getDate());
      var Meal_Date = /\d{8}$/g.test(msg) ? msg.replace(/meal\.lunch|meal\.dinner/g, '').trim() : Meal_Pre_Date1.getFullYear() + (Meal_Pre_Date2 > 10 ? Meal_Pre_Date2 : "0" + Meal_Pre_Date2) + (Meal_Pre_Date3 > 10 ? Meal_Pre_Date3 : "0" + Meal_Pre_Date3);
      var Meal_Data = Jsoup.connect('https://open.neis.go.kr/hub/mealServiceDietInfo?ATPT_OFCDC_SC_CODE=B10&SD_SCHUL_CODE=7010169&MLSV_YMD=' + Meal_Date).ignoreHttpErrors(true).get().toString().split('<DDISH_NM>')
      if (Meal_Data[1] == null) return 'false';
      replier.reply(Meal_Noti_Room, Meal_Data[msg.startsWith('meal.lunch') ? 1 : 2].split('CDATA[')[1].split(']]>')[0].split('<br/>').map((v) => {
        return v.replace(/bh|bm|bml|bmj|\*|\d*\./g, '').replace(/\(\)/g, '').trim();
      }).join('\n'));
    } catch (e) {
      replier.reply('Error: ' + e.message);
    }
  }

  if (msg.startsWith("기포")) {
    if (msg.endsWith("야") || msg.endsWith("아") || msg.length == 2) {
      var gipo = ["네, 부르셨나요?", "네, 기포에요.", "무슨 일이신가요?", "네, 기포입니다.", "네, 무엇을 원하시나요?", "네, 말씀해주세요.", "김형근 병신"];
      var r = Math.floor(Math.random() * gipo.length);
      replier.reply(gipo[r]);
    }
  }
  if (msg.match(/(안녕|반가워|하이|헬로|안뇽|ㅎㅇ|반갑다|반갑노|안녕하노|노무현)$/) && msg.indexOf("기포") == 0) {
    var gipo = ["안녕하세요.", "안녕하세요, 기포에요.", "안녕하세요, 무엇을 원하시나요?", "안녕하세요, 전 기포에요.", "반가워요, 기포에요.", "안녕하세요, 무엇을 도와드릴까요?", "네, 안녕하세요."];
    var r = Math.floor(Math.random() * gipo.length);
    replier.reply(gipo[r]);
  }
  if (msg.startsWith("기포")) {
    if (msg.match(/(코로나|확진자|감염자)/) && msg.replace(/ /g, "").replace("?", "").match(/(보여줘|몇명이야|알려줘|구해줘|코로나|확진자|감염자|몇명|몇명임|몇명이노|몇명이누|몇이노)$/)) {
      try {
        replier.reply("검색하고 있어요.");
        var corona_main = Utils.getWebText("https://wuhanvirus.kr/");
        var corona = JSON.parse(corona_main.split("KrLocation\":")[1].split("]")[0] + "]");
        var corona_people = JSON.parse("{" + corona_main.split("{\"cc\":\"KR\",")[1].split(",\"tested\":")[0] + "}");
      } catch (e) {
        replier.reply("죄송해요, 불러오지 못했어요. 잠시후에 시도해주세요.");
        return;
      }
      try {
        var corona_time = Utils.getWebText("https://m.search.naver.com/search.naver?query=%EC%BD%94%EB%A1%9C%EB%82%98").split("최종업데이트")[1].split("</p>")[0].replace(/(<[^>]+>)/g, "").trim();
      } catch (e) {
        var corona_time = "";
      }
      var arr = [];
      for (i = 0; i < corona.length; i++) {
        arr.push(corona[i]["region"] + " " + corona[i]["confirmed"]);
      }
      var result = {};
      arr.map(s => {
        var a = s.match(/(.+) (\d+)/);
        if (!result[a[2]])
          result[a[2]] = [];
        result[a[2]].push(a[1]);
      });
      var j = [];
      for (i = 0; i < Object.keys(result).length; i++) {
        j.push(result[Object.keys(result).reverse()[i]] + " : " + SplitNum(Object.keys(result).reverse()[i]) + "명");
      }
      var daily_corona = Jsoup.connect("https://m.search.naver.com/search.naver?&query=%EC%BD%94%EB%A1%9C%EB%82%98&where=m").get().select("div [class=status_today]").select("em[class=info_num]").toArray().map(e => parseInt(e.text()));
      replier.reply("지역별 코로나-19 확진자를 불러왔어요.\n\n" + j.join("\n") + "\n\n국내발생 : " + daily_corona[0] + "명\n해외유입 : " + daily_corona[1] + "명\n합계 : " + (daily_corona[0] + daily_corona[1]) + "명\n\n총확진자 : " + SplitNum(corona_people["confirmed"]) + "명\n사망자 : " + SplitNum(corona_people["death"]) + "명\n격리해제 : " + SplitNum(corona_people["released"]) + "명\n마지막 업데이트 : " + corona_time);
    }
  }
  if (msg.endsWith('ㅋㅋ')) {
    if ((Math.random() * 13) < 2) {
      java.lang.Thread.sleep(5000);
      replier.reply('ㄷㄷ');
    }
  }
  if (msg.startsWith('=계산')) {
    var calculated = JSON.parse(Jsoup.connect('https://m.search.naver.com/p/csearch/content/qapirender.nhn?_callback=window.__jindo2_callback._calculate_0&where=nexearch&pkid=69&q=' + encodeURIComponent(msg.slice(3).trim()) + '&p9=0').ignoreContentType(true).execute().body().match(/\((.*?)\)/)[1])['result']
    replier.reply(calculated['status'] == 'success' ? calculated['value'] : '계산 실패')
  }

  if (msg.startsWith("=국밥계산")) {
    if (isNaN(msg.slice(5).trim())) {
      replier.reply("숫자를 입력해주세요.");
      return;
    }
    replier.reply(((parseInt(msg.slice(5).trim()) / 5600).toFixed(1) + "국밥").replace(".0", ""));
  }

  if (msg.toLowerCase().startsWith('=BMI'.toLowerCase())) {
    var Pre_BMI = msg.slice(4).trim().split(' ');
    var BMI = Pre_BMI.length == 1 ? Pre_BMI[0] : 
    isNaN(BMI) ? BMI = BMI : BMI = Number(BMI).toFixed(2);
    switch (true) {
      case BMI < 10:
        replier.reply('BMI ' + BMI + '(스켈레톤)');
        break;
      case BMI < 16:
        replier.reply('BMI ' + BMI + '(사회복무요원)');
        break;
      case BMI < 18.5:
        replier.reply('BMI ' + BMI + '(저체중)');
        break;
      case BMI < 23:
        replier.reply('BMI ' + BMI + '(정상)');
        break;
      case BMI < 25:
        replier.reply('BMI ' + BMI + '(과체중)');
        break;
      case BMI < 30:
        replier.reply('BMI ' + BMI + '(비만)');
        break;
      case BMI < 35:
        replier.reply('BMI ' + BMI + '(고도비만)');
        break;
      case BMI > 40:
        replier.reply('BMI ' + BMI + '(자살 요망)');
        break;
      case BMI >= 35:
        replier.reply('BMI ' + BMI + '(사회복무요원)');
        break;
      default:
        replier.reply(BMI + BMI.Particle(['은', '는']) + ' 잘못된 입력입니다.');
        break;
    }
  }



  function similarity(s1, s2) {
    if (s1 == s2) return 1;
    const dec = str => str.split('').map(v => /[가-힣]/.test(v) ? v.normalize('NFD').split('').map(a => a.charCodeAt()).map((a, i) => i ? (i - 1 ? ' ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ' [a - 4519] : 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ' [a - 4449]) : 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ' [a - 4352]).join('') : v);
    const similar = (s1, s2) => {
      if (s2.length > s1.length) return similar(s2, s1);
      if (s2.length == 0) return 0;
      let d = Array(s2.length + 1).fill().map((v, i) => i ? [i] : Array(s1.length + 1).fill().map((v, j) => j));
      for (let i = 1; i <= s2.length; i++) {
        for (let j = 1; j <= s1.length; j++) {
          d[i][j] = Math.min(
            d[i][j - 1] + 1,
            d[i - 1][j] + 1,
            d[i - 1][j - 1] + (s2[i - 1] != s1[j - 1])
          );
        }
      }
      return 1 - parseInt(d[s2.length][s1.length] / s1.length * 10) / 10;
    };
    return similar(dec('1' + s1).slice(1).join(''), dec('2' + s2).slice(1).join(''));
  }

  FT_P = Typo => {
    FT_1 = Jsoup.connect("https://www.google.com/search?q=" + url(Typo)).get();
    return FT_1.select("#fprsl > em").text() == '' ? FT_1.select("#oFNiHe > p > a > em").text() : FT_1.select("#fprsl > em").text()
  }

  function SplitNum(value) {
    value = (typeof value !== 'undefined') ? value : 0;
    return value.toString().replace(/(\d+?)((?=(?:\d{3})+(?!\d)))/g, "$1,$2");
  }

  String.prototype.Particle = function (Array) {
    return str.slice(-1).normalize('NFKD')[2] ? Array[0] : Array[1];
  }

  try {
    if (Certified && msg.indexOf("*") == 0) {
      replier.reply(room, eval(msg.slice(1)));
    } else if (!Certified && msg.indexOf("*") == 0) {
      replier.reply("관리자 권한이 없어요.");
    }
  } catch (e) {
    replier.reply("오류가 발생했어요\n\n오류 : " + e.name + " " + e.message);
  }
}