const {
  KakaoLinkClient
} = require('kakaolink');
const Kakao = new KakaoLinkClient("68fb208e85089837436b4b368fb90ca6", "https://gipo.kro.kr")
Kakao.login("r6spuko@gmail.com", "yuwon0621");
const 전체보기 = " ".repeat(1000);
Jsoup = org.jsoup.Jsoup;
allsee = " ".repeat(500);
bar = "━━━━━━━━━━━━━━";
let db = null;
let db2 = null;
let myUserId = null;
const 홀짝경영자 = "김재형";
const MaxLevel = 99;
const MaxExpand = 60;
const ExpandCost = 100000;
const BufferedReader = java.io.BufferedReader;
const DataOutputStream = java.io.DataOutputStream;
const InputStreamReader = java.io.InputStreamReader;
const HttpURLConnection = java.net.HttpURLConnection;
const URL = java.net.URL;
const URLEncoder = java.net.URLEncoder;

function url(link) {
  return encodeURIComponent(link);
}

function updateDB() {
  db = android.database.sqlite.SQLiteDatabase.openDatabase("/data/data/com.kakao.tall/databases/KakaoTalk.db", null, android.database.sqlite.SQLiteDatabase.CREATE_IF_NECESSARY);
  db2 = android.database.sqlite.SQLiteDatabase.openDatabase("/data/data/com.kakao.tall/databases/KakaoTalk2.db", null, android.database.sqlite.SQLiteDatabase.CREATE_IF_NECESSARY);
  myUserId = getMyUserId();
}

function copyfile(inputpath, outputpath) {
  var stream_in = new java.io.FileInputStream(inputpath);
  var stream_out = new java.io.FileOutputStream(outputpath);
  var channel_in = stream_in.getChannel();
  var channel_out = stream_out.getChannel();
  channel_in.transferTo(0, channel_in.size(), channel_out);
  channel_out.transferFrom(channel_in, 0, channel_in.size());
  channel_out.close();
  channel_in.close();
  stream_out.close();
  stream_in.close();
}

function log(json) {
  try {
    list = json.map(e => {
      let userName = getUserName(e.user_id);
      let message;
      let att = e.attachment && JSON.parse(e.attachment);
      let mes = e.message;
      if (userName) {
        if (e.type.toString().startsWith("16")) {
          if (!att) {
            message = "삭제된 메시지 - " + e.message;
          } else {
            message = "삭제된 메시지 - " + JSON.stringify(att);
          }
        }
        if (e.type == 27) {
          message = "사진 - " + att.imageUrls.join(", ");
        }
        if (e.type == 2) {
          message = "사진 - " + att.url;
        }
        if (e.type == 3) {
          message = "동영상 - " + att.url;
        }
        if (e.type == 71) {
          message = "카카오링크 - " + mes;
        }
        if (e.type == 23) {
          message = "샵검색 - " + mes;
        }
        if (e.type == 5) {
          message = "음성 메시지 - " + att.url;
        }
        if (e.type == 12 || e.type == 20) {
          message = "이모티콘 - " + "https://item.kakaocdn.net/dw/" + att.path.replace("webp", "png").replace("emot", "thum");
        }
        if (e.type == 18) {
          message = "파일 - " + att.url;
        }
        if (e.type == 1) {
          if (!att || !att.path) {
            if (mes) {
              message = mes;
            }
          } else {
            message = "전체보기 - " + Jsoup.connect("http://dn-m.talk.kakao.com" + att.path).ignoreContentType(true).get().text();
          }
        }
        if (e.type == 26) {
          try {
            message = "답장 - " + mes + " (" + getUserData(att["src_userId"]).name + "님의 \"" + att.src_message + "\")";
          } catch (e) {}
        }
        if (e.type == 17) {
          message = "카카오톡 프로필 - " + att.nickName;
        }
        if (e.type == 0) {
          if (e.v.origin == "NEWMEM") {
            message = "입장 - " + userName + "님이 입장 하였습니다.";
          } else {
            if (e.v.origin == "DELMEM") {
              if (JSON.parse(mes).feedType == 2) {
                message = "퇴장 - " + userName + "님이 퇴장 하였습니다.";
              } else {
                if (JSON.parse(mes).feedType == 6) {
                  message = "내보내기 - " + userName + "님이 " + JSON.parse(mes).member.nickName + " 님을 내보내기 하였습니다.";
                }
              }
            } else {
              if (e.v.origin == "KICKMEM") {
                message = "내보내기 - " + userName + "님이 " + JSON.parse(mes).member.nickName + " 님을 내보내기 하였습니다.";
              }
            }
          }
        }
        return message ? e.v.c.split(" ")[1] + " " + userName + "님\n => " + message : undefined;
      }
    });
    return ("채팅기록" + new Array(500).join(" ") + "\n\n" + list.join("\n\n")).substr(0, 25000);
  } catch (e) {
    return e.substr(0, 25000);
  }
}

function getChatJson(num) {
  let data = [];
  let cursor = db.rawQuery("select * from chat_logs where chat_id=? order by created_at desc ", [280944971289635]);
  cursor.moveToFirst();
  let columns = cursor.getColumnNames();
  for (var i = 0; i < num; i++) {
    let obj = {};
    columns.forEach((e, ii) => obj[e] = cursor.getString(ii));
    obj.v = JSON.parse(obj.v);
    obj.attachment = decrypt(obj.user_id, obj.v.enc, obj.attachment);
    obj.message = decrypt(obj.user_id, obj.v.enc, obj.message);
    data.push(obj);
    cursor.moveToNext();
  }
  return data;
}

function getRoomChatJson(chatId, num) {
  let data = [];
  let cursor = db.rawQuery("select * from chat_logs where chat_id=? order by created_at desc ", [chatId]);
  cursor.moveToFirst();
  let columns = cursor.getColumnNames();
  for (var i = 0; i < num; i++) {
    let obj = {};
    columns.forEach((e, ii) => obj[e] = cursor.getString(ii));
    obj.v = JSON.parse(obj.v);
    obj.attachment = decrypt(obj.user_id, obj.v.enc, obj.attachment);
    obj.message = decrypt(obj.user_id, obj.v.enc, obj.message);
    data.push(obj);
    cursor.moveToNext();
  }
  return data;
}

function getUserChatJson(userId) {
  let data = [];
  let cursor = db.rawQuery("select * from chat_logs where user_id=? order by created_at desc limit 10000", [userId]);
  cursor.moveToFirst();
  let columns = cursor.getColumnNames();
  for (var i = 0; i < cursor.getCount(); i++) {
    let obj = {};
    columns.forEach((e, ii) => obj[e] = cursor.getString(ii));
    obj.v = JSON.parse(obj.v);
    obj.attachment = decrypt(obj.user_id, obj.v.enc, obj.attachment);
    obj.message = decrypt(obj.user_id, obj.v.enc, obj.message);
    data.push(obj);
    cursor.moveToNext();
  }
  return data;
}

function getUserName(user_id) {
  let cursor = db2.rawQuery("select * from friends where id=?", [user_id]);
  cursor.moveToFirst();
  return decrypt(myUserId, cursor.getString(32), cursor.getString(7));
}

function getMyUserId() {
  let cursor = db2.rawQuery("select id from friends where rowid=?", [2]);
  cursor.moveToFirst();
  return cursor.getString(0);
}
const getChatId = () => {
  var d = db.rawQuery("SELECT chat_id FROM chat_logs order by created_at desc limit 1", null);
  d.moveToLast();
  return d.getString(0);
};
const getAllids = (chat_id) => {
  try {
    let list = "";
    let cursor = db.rawQuery("SELECT members FROM chat_rooms WHERE id=" + chat_id, null);
    cursor.moveToNext();
    list = cursor.getString(0);
    cursor.close();
    return list.replace("[", "").replace("]", "").split(',');
  } catch (e) {
    return null;
  }
};

function toByteArray(bytes) {
  let res = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, bytes.length);
  bytes.forEach((e, i) => res[i] = new java.lang.Integer(e).byteValue());
  return res;
}

function toCharArray(chars) {
  return new java.lang.String(chars.map((e) => String.fromCharCode(e)).join("")).toCharArray();
}

function decrypt(userId, enc, text) {
  try {
    let iv = toByteArray([15, 8, 1, 0, 25, 71, 37, -36, 21, -11, 23, -32, -31, 21, 12, 53]);
    let password = toCharArray([22, 8, 9, 111, 2, 23, 43, 8, 33, 33, 10, 16, 3, 3, 7, 6]);
    let prefixes = ["", "", "12", "24", "18", "30", "36", "12", "48", "7", "35", "40", "17", "23", "29", "isabel", "kale", "sulli", "van", "merry", "kyle", "james", "maddux", "tony", "hayden", "paul", "elijah", "dorothy", "sally", "bran", "extr.ursra"];
    let salt = new java.lang.String((prefixes[enc] + userId).slice(0, 16).padEnd(16, "\x00")).getBytes("UTF-8");
    let secretKeySpec = new javax.crypto.spec.SecretKeySpec(javax.crypto.SecretKeyFactory.getInstance("PBEWITHSHAAND256BITAES-CBC-BC").generateSecret(new javax.crypto.spec.PBEKeySpec(password, salt, 2, 256)).getEncoded(), "AES");
    let ivParameterSpec = new javax.crypto.spec.IvParameterSpec(iv);
    let cipher = javax.crypto.Cipher.getInstance("AES/CBC/PKCS5Padding");
    cipher.init(2, secretKeySpec, ivParameterSpec);
    return new java.lang.String(cipher.doFinal(android.util.Base64.decode(text, 0)), "UTF-8").toString();
  } catch (e) {}
}
Array.prototype.remove = function (id) {
  var index = this.indexOf(id);
  if (index >= 0) {
    this.splice(index, 1);
    return this;
  } else {
    return this;
  }
};
var sdcard = android.os.Environment.getExternalStorageDirectory().getAbsolutePath();

function save(folderName, fileName, str) {
  var c = new java.io.File(sdcard + "/" + folderName + "/" + fileName + ".json");
  var d = new java.io.FileOutputStream(c);
  var e = new java.lang.String(str);
  d.write(e.getBytes());
  d.close();
}

function read(folderName, fileName) {
  var b = new java.io.File(sdcard + "/" + folderName + "/" + fileName + ".json");
  if (!(b.exists()))
    return null;
  try {
    var c = new java.io.FileInputStream(b);
    var d = new java.io.InputStreamReader(c);
    var e = new java.io.BufferedReader(d);
  } catch (e) {
    return null;
  }
  var f = e.readLine();
  var g = "";
  while ((g = e.readLine()) != null) {
    f += "\n" + g;
  }
  c.close();
  d.close();
  e.close();
  return f.toString();
}

function 분해(kor) {
  const f = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  const s = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
  const t = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  const ga = 44032;
  let uni = kor.charCodeAt(0);
  uni = uni - ga;
  let fn = parseInt(uni / 588);
  let sn = parseInt((uni - (fn * 588)) / 28);
  let tn = parseInt(uni % 28);
  return f[fn] + s[sn] + t[tn];
}
cCho = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
cJung = ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"];
cJong = ["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
kor = "ㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔㅁㄴㅇㄹㅎㅗㅓㅏㅣㅋㅌㅊㅍㅠㅜㅡ";
sep = han => {
  return han.split("").map(str => {
    cnt = str.length;
    if (str.match(/[ㄱ-ㅎ가-힣]/)) {
      chars = [];
      var cCode;
      for (i = 0; i < cnt; i++) {
        cCode = str.charCodeAt(i);
        if (cCode < 0xAC00 || cCode > 0xD7A3) {
          chars.push(str.charAt(i));
          continue;
        }
        cCode = str.charCodeAt(i) - 0xAC00;
        jong = cCode % 28;
        jung = ((cCode - jong) / 28) % 21;
        cho = (((cCode - jong) / 28) - jung) / 21;
        chars.push(cCho[cho], cJung[jung]);
        cJong[jong] && chars.push(cJong[jong]);
      }
      return chars.join("");
    }
    return str;
  }).join("");
};
dis = (a, b) => {
  a = a.split("").map(char => char.match(/[ㄱ-ㅎ가-힣]/) ? sep(char) : char).join("");
  b = b.split("").map(char => char.match(/[ㄱ-ㅎ가-힣]/) ? sep(char) : char).join("");
  if (!a.length)
    return b.length;
  if (!b.length)
    return a.length;
  l = Math.max(a.length, b.length);
  matrix = [];
  Array(b.length + 1).fill().map((_, i) => matrix[i] = [i]);
  Array(a.length + 1).fill().map((_, i) => matrix[0][i] = i);
  Array(b.length).fill().map((_, i) => Array(a.length).fill().map((_, j) => matrix[i + 1][j + 1] = b.charAt(i) == a.charAt(j) ? matrix[i][j] : Math.min(matrix[i][j] + 1, Math.min(matrix[i + 1][j] + 1, matrix[i][j + 1] + 1))));
  return ((100 - (matrix[b.length][a.length] / l * 100)) | 0) + "%";
};

function 을를(kor, typeie) {
  if (typeie == "을를") {
    var retult = "을";
    if (분해(kor.substr(-1)).length == 2) {
      retult = "를";
    }
    return retult;
  }
  if (typeie == "이가") {
    var retult = "이";
    if (분해(kor.substr(-1)).length == 2) {
      retult = "가";
    }
    return retult;
  }
}
Array.prototype.division = function (n) {
  var arr = this;
  var len = arr.length;
  var cnt = Math.floor(len / n) + (Math.floor(len % n) > 0 ? 1 : 0);
  var tmp = [];
  for (var i = 0; i < cnt; i++) {
    tmp.push(arr.splice(0, n));
  }
  return tmp;
};
Object.prototype.make = function (key, value) {
  return this[key] = value;
};
Array.prototype.substitute = function (where, value) {
  this.splice(where, 1, value);
  return this;
};
var 조회목록 = [];
var Searcher = null;
var called = [];

function response(room, msg, sender, isGroupChat, replier, ImageDB, packageName, threadId) {
  if (!['건전한 아이들', 'Room1', 'Room2'].includes(room) || (!(sender.endsWith('~#~')) && room != 'Room2')) {
    return;
  }
  msg = msg.trim();
  sender = sender.trim().replace("~#~", "");
  var 나사 = ImageDB.getProfileImage().substr(1300, 10);
  var 프사 = 나사.replace(/\n/g, "\\n").replace(/\//g, "").replace("c01iTU+F\\nw", "LP6S6PtN\\nV");
  var Certifiedbefore = ["JVjGO4ui\ne", "OMJVjGO4\nu", "x5rCxjQT\ng", "4FCTpSO\\nK", "sfIx5rCx\nj"].includes(나사);
  var Certified = ['이상수'].includes(sender);
  if (msg.startsWith("=원격") && Certified) {
    sender = msg.slice(3).trim().split(';')[0].trim();
    msg = msg.slice(3).trim().split(';')[1].trim();
  }
  var 정보 = JSON.parse(read("건아시스템", "정보"));
  var sender_info = 정보[sender];
  var sender_name = sender;
  if (sender_info != null && sender_info[0] != 'default') {
    sender_name = sender_info[0];
  }
  var 리미트 = true;
  var 시간 = JSON.parse(read("건아시스템", "시간"));
  var 업적 = JSON.parse(read("건아시스템", "업적"));
  var mfeat = 업적[sender];
  var 시스템 = JSON.parse(read("건아시스템", "건아시스템"));
  var 주식 = JSON.parse(read("건아시스템", "주식"));
  var crops = JSON.parse(read('건아시스템', 'crops'));
  var Image = JSON.parse(read('건아시스템', 'Image'));
  var tier = Image['tier'];
  const daily_make = [new Date(), new Date(), new Date(), 0, 6, 0, '비어 있음.'];
  const info_make = ['default', 0, 1, 0, 0, 1, 0, 0, 0, 0, [], {}, 0, 0, 0, 0, 0, 0, 0, 0, (Math.floor(Math.random() * 10).toString() + Math.floor(Math.random() * 10).toString() + Math.floor(Math.random() * 10).toString() + '-' + Math.floor(Math.random() * 10).toString() + Math.floor(Math.random() * 10).toString() + Math.floor(Math.random() * 10).toString() + '-' + Math.floor(Math.random() * 10).toString() + Math.floor(Math.random() * 10).toString() + Math.floor(Math.random() * 10).toString())];
  const feat_make = {
    '농작물 수확': 0,
    '홀짝 성공': 0,
    '홀짝 실패': 0,
    '출석 횟수': 0,
    '출석으로 받은 돈': 0
  };
  if (JSON.parse(read("BlackList", "BlackList")).includes(sender) && !Certified) {
    return;
  }
  if (msg == "=내정보") {
    if (sender_info == null) {
      정보.make(sender, info_make);
      replier.reply("환영합니다. " + sender + "님, 정보를 새로 생성했습니다.");
    }
    if (mfeat == null) {
      업적[sender] = feat_make;
      replier.reply('업적 정보를 갱신했습니다.');
    }
    내정보(sender);
    saveInfo();
  }
  if (msg == '=내업적') {
    if (sender_info == null || mfeat == null) {
      replier.reply("오류 : 정보가 올바르지 않습니다. \n\n'=내정보'로 정보를 확인해주세요.");
      return;
    }
    feat_result = [];
    for (i = 0; i < Object.keys(업적[sender]).length; i++) {
      feat_result.push(Object.keys(업적[sender])[i] + ' : ' + SplitNum(업적[sender][Object.keys(업적[sender])[i]]));
    }
    replier.reply(sender_name + '님의 업적\n\n' + feat_result.join('\n'));
  }
  if (msg == '=내계좌' || msg.startsWith('=계좌')) {
    if (sender_info == null || mfeat == null) {
      replier.reply("오류 : 정보가 올바르지 않습니다. \n\n'=내정보'로 정보를 확인해주세요.");
      return;
    }
    if (msg.startsWith('=계좌') && msg.slice(3).trim() != '') {
      if (정보[msg.slice(3).trim()] == null) {
        replier.reply('오류 : 존재하지 않는 사용자입니다.\n\n조회하려는 상대의 이름을 정확하게 입력해주세요.');
        return;
      }
      replier.reply(msg.slice(3).trim() + '님의 계좌번호는\n' + 정보[msg.slice(3).trim()][20]);
      return;
    }
    replier.reply(sender + '님의 계좌번호는\n' + 정보[sender][20]);
  }
  if (msg.indexOf("=매수") == 0 || msg.indexOf("=매도") == 0) {
    if (sender_info == null || mfeat == null) {
      replier.reply("오류 : 정보가 올바르지 않습니다. \n\n'=내정보'로 정보를 확인해주세요.");
      return;
    }
    var fmsg = msg.substr(1, 2);
    var smsg = msg.slice(3).trim().split(" ");
    var stock_count = parseInt(smsg[1]);
    if (smsg.length != 2 || isNaN(stock_count)) {
      replier.reply("오류 : 형식이 잘못되었습니다.\n\n'=매수'나 '=매도' 뒤에는 매수 또는 매도를 원하는 종목명을 입력하고 띄어쓰기로 구분 후 매수 또는 매도할 개수를 입력하셔야 합니다.\n\n예시 ) '=매수 넷마블 10'");
      return;
    }
    if (isNaN(stock_count) || stock_count < 1) {
      replier.reply("오류 : 숫자가 올바르지 않습니다.\n\n개수를 입력할땐 매수 또는 매도를 원하는 정확한 개수를 입력해주세요.\n\n예시 ) '=매도 넷마블 10'");
      return;
    }
    if (stock_count > 10000) {
      replier.reply("오류 : 한도를 초과했습니다.\n\n최대 10000주까지 매수 또는 매도 할 수 있습니다.");
      return;
    }
    var stock = JSON.parse(read("건아시스템", "주식"));
    if (Object.keys(stock).indexOf(smsg[0]) == -1 || stock[smsg[0]] == 9990999) {
      replier.reply("오류 : 존재하지 않는 종목명입니다.\n\n'=시세'로 종목을 확인하세요.");
      return;
    }
    stock_update();
    var stock_price = stock[smsg[0]] * stock_count;
    if (stock_price < 1) {
      replier.reply("오류 : 주식의 가격이 0원 미만입니다.\n\n파산 업데이트를 기다려주세요.");
      return;
    }
    switch (fmsg) {
      case "매수":
        var allow_count = parseInt(sender_info[1] / stock[smsg[0]]);
        if (sender == 홀짝경영자) {
          allow_count = parseInt((sender_info[1] - 1000000) / stock[smsg[0]]);
          if (sender_info[1] < 1000000) {
            allow_count = 0;
          }
        }
        if (stock_price < 총자산(sender) && stock_price > sender_info[1]) {
          replier.reply("오류 : 현금이 부족합니다.\n\n'=매도'로 가진 주식을 현금으로 교환하세요.\n\n예시 ) '=매도 넷마블 10'\n" + allow_count + "주 매수가능.");
          return;
        }
        if (stock_price > sender_info[1]) {
          replier.reply("오류 : 돈이 부족합니다.\n\n'=출석'으로 매일 보상을 받으세요.\n" + allow_count + "주 매수가능.");
          return;
        }
        if (sender == 홀짝경영자 && sender_info[1] - stock_price < 1000000) {
          replier.reply("오류 : 경영자금이 부족합니다.\n\n현금은 최소한 100만원을 보유해야 합니다.\n" + allow_count + "주 매수가능.");
          return;
        }
        sender_info.substitute(1, sender_info[1] - stock_price);
        sender_info.substitute(12 + Object.keys(stock).indexOf(smsg[0]), sender_info[12 + Object.keys(stock).indexOf(smsg[0])] + stock_count);
        replier.reply(smsg[0] + 을를(smsg[0], "을를") + " " + stock_count + "주 매수했습니다.");
        break;
      case "매도":
        if (sender_info[12 + Object.keys(stock).indexOf(smsg[0])] < stock_count) {
          replier.reply("오류 : 보유한 주식이 부족합니다.\n\n매도하려는 개수보다 적게 가지고 있습니다.\n" + sender_info[12 + Object.keys(stock).indexOf(smsg[0])] + "주 매도가능.");
          return;
        }
        sender_info.substitute(1, sender_info[1] + stock_price);
        sender_info.substitute(12 + Object.keys(stock).indexOf(smsg[0]), sender_info[12 + Object.keys(stock).indexOf(smsg[0])] - stock_count);
        replier.reply(smsg[0] + 을를(smsg[0], "을를") + " " + stock_count + "주 매도했습니다.");
        break;
    }
    saveInfo();
  }
  if (msg == "=시세") {
    stock_update();
    var stock = JSON.parse(read("건아시스템", "주식"));
    var pre_result = [];
    for (i = 0; i < Object.keys(stock).length; i++) {
      if (stock[Object.keys(stock)[i]] != 9990999) {
        pre_result.push([Object.keys(stock)[i], Object.keys(stock)[i].length]);
      }
    }
    var final_result = pre_result.sort(function (a, b) {
      return b[1] - a[1];
    }).reverse().map(r => [r[0], stock[r[0]]]);
    replier.reply(final_result.map(r => r[0] + " ] " + SplitNum(r[1])).join("\n") + "\n\n다음 변동 ⎼⎼⎼ " + (parseInt((600 - parseInt((new Date() - new Date(시스템[1])) / 1000)) / 60) + "분").replace("0분", "") + (parseInt(600 - parseInt((new Date() - new Date(시스템[1])) / 1000)) % 60) + "초");
  }
  if (msg.startsWith('=농장')) {
    var daily = JSON.parse(read('건아시스템', '시간'));
    if (daily[sender] == null) {
      daily.make(sender, daily_make);
    }
    if (msg.slice(3).trim() == '') {
      replier.reply('-농장 시스템 간단 가이드-\n\n\'=농장\' 농장 명령어를 확인합니다.\n\'=농장 비우기\' 농장을 비웁니다.\n\'=농장 확장 (개수)\' 농장의 최대면적을 확장합니다.\n\'=내농장\' 심은 작물을 확인합니다.\n\'=작물 (1-2)\' 재배 가능 작물을 확인합니다.\n\'=재배\' 심은 작물을 수확합니다.\n\'=재배 (작물)\' 작물을 구매해 심습니다.\n\n작물을 자신의 농장 면적에 맞게 심고 재배하여 이익을 보는 시스템입니다.\n초기 농장 면적은 5칸이며 돈을 사용해 확장가능합니다.\n\n현재 ' + sender_name + '님의 농장 면적은 ' + daily[sender][4] + '칸입니다.');
      return;
    }
    if (msg.slice(3).trim() == '비우기') {
      var daily = JSON.parse(read('건아시스템', '시간'));
      if (daily[sender] == null) {
        daily.make(sender, daily_make);
      }
      if (daily[sender][5] != 0 || daily[sender][6] != '비어 있음.') {
        daily[sender][5] = 0;
        daily[sender][6] = '비어 있음.';
        save('건아시스템', '시간', JSON.stringify(daily));
        replier.reply('농장을 비웠습니다.');
        return;
      }
      replier.reply('농장이 이미 비어있습니다.');
    }
    if (msg.slice(3).trim().startsWith('확장')) {
      msg = msg.slice(3).trim().slice(2).trim();
      if (sender_info == null) {
        replier.reply("오류 : 정보가 올바르지 않습니다. \n\n'=내정보'로 정보를 확인해주세요.");
        return;
      }
      if (!Certified && !sender == "산") {
        replier.reply("오류 : 이미 사용중인 닉네임 입니다.\n\n혹시 프로필 사진을 바꾸셨나요?\n'=호출'로 문의 해주세요.");
        return;
      }
      var daily = JSON.parse(read('건아시스템', '시간'));
      if (daily[sender] == null) {
        daily.make(sender, daily_make);
      }
      if (isNaN(parseInt(msg))) {
        replier.reply('오류 : 숫자가 올바르지 않습니다.\n\n확장하려는 칸의 개수를 입력해주세요.');
        return;
      }
      if (sender_info[1] < parseInt(msg) * ExpandCost) {
        replier.reply('오류 : 돈이 부족합니다.\n\n\'=출석\'으로 매일 보상을 받으세요.\n' + parseInt(sender_info[1] / 100000) + '칸 확장가능');
        return;
      }
      if (홀짝경영자 == sender && sender_info[1] - 1000000 < parseInt(msg) * ExpandCost) {
        replier.reply("오류 : 경영자금이 부족합니다.\n\n현금은 최소한 100만원을 보유해야 합니다.\n" + parseInt((sender_info[1] - 1000000) / ExpandCost) + "칸 확장가능.");
        return;
      }
      if (parseInt(msg) + daily[sender][4] > MaxExpand) {
        replier.reply('오류 : 농장의 최대 크기는 ' + MaxExpand + '칸입니다.\n\n최대 크기를 벗어나지 않도록 확장해주세요.\n\n현재 ' + sender_name + '님의 농장 면적은 ' + daily[sender][4] + '칸입니다.');
        return;
      }
      sender_info[1] -= ExpandCost * parseInt(msg);
      daily[sender][4] += parseInt(msg);
      saveInfo();
      save('건아시스템', '시간', JSON.stringify(daily));
      replier.reply('농장을 성공적으로 확장했습니다.\n' + SplitNum(ExpandCost * parseInt(msg)) + '원 지불함.\n\n현재 ' + sender_name + '님의 농장 면적은 ' + daily[sender][4] + '칸입니다.');
    }
    msg = '=' + (msg.slice(3).trim());
  }
  if (msg == '=내농장') {
    var daily = JSON.parse(read('건아시스템', '시간'));
    if (daily[sender] == null) {
      daily.make(sender, daily_make);
    }
    var farm_result = [
      [],
      []
    ];
    for (i = 0; i < daily[sender][4]; i++) {
      if (farm_result[0].length < daily[sender][5]) {
        farm_result[0].push('[ ' + daily[sender][6] + ' ]');
      } else {
        farm_result[1].push('[ 없음 ]');
      }
    }
    var pre_grow_time = Timeleft(new Date(new Date(daily[sender][1]).getTime() + 86400000));
    var grow_time = '수확 가능합니다!';
    if (pre_grow_time[1] && pre_grow_time[0] != '0분') {
      grow_time = '재배까지 ' + pre_grow_time[0] + '남았습니다.';
    }
    if (daily[sender][5] == 0) {
      grow_time = '심은 작물이 없습니다.';
    }
    if (daily[sender][4] < daily[sender][5]) {
      replier.reply('농장의 최대 면적보다 ' + (daily[sender][5] - daily[sender][4]) + '개가 추가로 심어져있습니다.');
    }
    replier.reply(sender_name + '님의 농장\n\n' + (farm_result[0].division(3).join('\n') + '\n\n' + farm_result[1].division(3).join('\n')).replace(/,/g, ' ').trim() + '\n\n' + grow_time);
  }
  if (msg.startsWith('=재배')) {
    if (sender_info == null || mfeat == null) {
      replier.reply("오류 : 정보가 올바르지 않습니다. \n\n'=내정보'로 정보를 확인해주세요.");
      return;
    }
    msg = msg.slice(3).trim();
    var daily = JSON.parse(read('건아시스템', '시간'));
    if (daily[sender] == null) {
      daily.make(sender, daily_make);
    }
    if (msg == '') {
      if (daily[sender][5] == 0 || daily[sender][6] == '비어 있음.') {
        replier.reply('오류 : 심어진 작물이 없습니다.\n\n\'=재배 (작물)\'로 작물을 심어주세요.');
        return;
      }
      var isGrown = Timeleft(new Date(new Date(daily[sender][1]).getTime() + 86400000));
      if (isGrown[1] && isGrown[0] != '0분') {
        replier.reply('오류 : 작물이 아직 자라지 않았습니다.\n\n작물이 모두 성장하면 재배해주세요.\n남은 시간 : ' + isGrown[0]);
        return;
      }
      var crops_cost = Math.floor(Math.floor(crops[daily[sender][6]][1][0] + (Math.floor(Math.random() * crops[daily[sender][6]][1][1]) + 1)) * daily[sender][5]);
      var suc_msg = '작물을 재배했습니다.';
      var suc_per = 30;
      if (정보[sender][11]['농사'] != null) {
        suc_per += (0.5 * 정보[sender][11]['농사']);
      }
      if ((Math.floor(Math.random() * 10000) + 1) / 100 < suc_per) {
        suc_msg = '작물을 성공적으로 재배했습니다!';
        crops_cost = parseInt(crops_cost * 1.25);
      }
      정보[sender][1] += crops_cost;
      add_exp(sender, parseInt((crops_cost * 0.02) * ((Math.floor(Math.random() * 100) + 50) / 100)));
      업적[sender]['농작물 수확'] += daily[sender][5];
      daily[sender][5] = 0;
      daily[sender][6] = '비어 있음.';
      save('건아시스템', '시간', JSON.stringify(daily));
      saveInfo();
      replier.reply(suc_msg + '\n' + SplitNum(crops_cost) + '원 지급됨.');
      return;
    }
    if (!Object.keys(crops).includes(msg)) {
      replier.reply('오류 : 심을 수 없는 작물입니다.\n\n\'=작물\'로 작물 종류를 확인하세요.');
      return;
    }
    if (daily[sender][6] != msg && daily[sender][6] != '비어 있음.') {
      replier.reply('오류 : 이미 작물이 심어져 있습니다.\n\n농장을 비우거나 수확 한 후 새로 심어주세요.');
      return;
    }
    if (sender_info[1] < crops[msg][0]) {
      replier.reply('오류 : 돈이 부족합니다.\n\n최소 하나의 작물을 심을 여유자금이 필요합니다.\n\'=출석\'으로 매일 보상을 받으세요.');
      return;
    }
    if (홀짝경영자 == sender && sender_info[1] - 1000000 < crops[msg][0]) {
      replier.reply("오류 : 경영자금이 부족합니다.\n\n현금은 최소한 100만원을 보유해야 합니다.\n" + parseInt((sender_info[1] - 1000000) / 1000) + "권 구입가능.");
      return;
    }
    if (sender_info[1] >= crops[msg][0]) {
      var count_crops = parseInt(sender_info[1] / crops[msg][0]);
      if (홀짝경영자 == sender) {
        var count_crops = parseInt((sender_info[1] - 1000000) / crops[msg][0]);
      }
      if (count_crops > daily[sender][4] - daily[sender][5]) {
        count_crops = daily[sender][4] - daily[sender][5];
      }
      if (count_crops == 0) {
        replier.reply('오류 : 이미 작물이 심어져 있습니다.\n\n농장을 비우거나 수확 한 후 새로 심어주세요.');
        return;
      }
      daily[sender][1] = new Date(new Date().getTime() + (crops[msg][3] - 24) * 3600000);
      daily[sender][5] += count_crops;
      daily[sender][6] = msg;
      sender_info[1] -= parseInt(crops[msg][0] * count_crops);
      replier.reply(msg + 을를(msg, '을를') + ' ' + count_crops + '개 심었습니다.\n' + SplitNum(parseInt(crops[msg][0] * count_crops)) + '원 지불함.');
      save('건아시스템', '시간', JSON.stringify(daily));
      saveInfo();
    }
    return;
  }
  if (msg.startsWith('=작물')) {
    msg = msg.slice(3).trim();
    var crops_page = 1;
    if (!msg == '' && !isNaN(parseInt(msg))) {
      crops_page = parseInt(msg);
    }
    var return_crops_info = '';
    var crops_name = Object.keys(crops).division(5);
    if (crops_name.length < crops_page || crops_page < 1) {
      replier.reply('오류 : 숫자가 올바르지 않습니다.\n\n작물목록은 ' + crops_name.length + '장까지 있습니다.\n범위 내로 입력해주세요.');
      return;
    }
    for (i = 0; i < 5; i++) {
      return_crops_info += crops_name[crops_page - 1][i] + ' : ' + SplitNum(crops[crops_name[crops_page - 1][i]][0]) + '₩\n[ ' + crops[crops_name[crops_page - 1][i]][3] + '시간 ] ' + crops[crops_name[crops_page - 1][i]][2] + '\n\n';
    }
    replier.reply(return_crops_info.trim());
  }
  if (msg.startsWith('=닉네임')) {
    if (sender_info == null || mfeat == null) {
      replier.reply("오류 : 정보가 올바르지 않습니다. \n\n'=내정보'로 정보를 확인해주세요.");
      return;
    }
    if (msg.slice(4).trim().startsWith('변경')) {
      if (정보[sender][1] < 1000) {
        replier.reply('오류 : 돈이 부족합니다.\n\n\'=출석\'으로 매일 보상을 받으세요.\n닉네임을 변경하려면 최소 1000원이 필요합니다.');
        return;
      }
      정보[sender][1] -= 1000;
      정보[sender][0] = msg.slice(4).trim().slice(2).trim();
      saveInfo();
      replier.reply('닉네임을 ' + msg.slice(4).trim().slice(2).trim() + '로 변경했습니다.');
      return;
    }
    if (msg.slice(4).trim() == '초기화') {
      if (정보[sender][0] == 'default') {
        replier.reply('이미 닉네임이 기본값입니다.');
        return;
      }
      정보[sender][0] = 'default';
      saveInfo();
      replier.reply('닉네임을 기본값으로 변경했습니다.');
      return;
    }
  }
  if (['=지도', '=내지도'].includes(msg)) {
    if (sender_info == null || mfeat == null) {
      replier.reply("오류 : 정보가 올바르지 않습니다. \n\n'=내정보'로 정보를 확인해주세요.");
      return;
    }
    if (Image['map'][정보[sender][10].sort().join('')] == null) {
      정보[sender][10] = [];
    }
    var map_arg = Image['map'][정보[sender][10].sort().join('')];
    var text_arg = '지도가 비어있습니다.';
    if (정보[sender][10].length > 0) {
      text_arg = '모험할 곳을 선택해 주세요.';
    }
    var sub_text_arg = '';
    Kakao.sendLink(room, {
      'link_ver': '4.0',
      'template_id': 50474,
      'template_args': {
        'map': map_arg,
        'text': text_arg,
        'sub_text': sub_text_arg
      }
    }, 'custom');
  }
  if (msg.startsWith('=송금')) {
    if (sender_info == null || mfeat == null) {
      replier.reply("오류 : 정보가 올바르지 않습니다. \n\n'=내정보'로 정보를 확인해주세요.");
      return;
    }
    var account = msg.slice(3).trim().replace(/[^0-9]/g, '').substr(0, 9).trim();
    if (account.length != 9 || typeof Object.keys(정보).find(v => 정보[v][20] == account.replace(/(\d+?)((?=(?:\d{3})+(?!\d)))/g, "$1-$2")) == 'undefined') {
      replier.reply('오류 : 대상의 계좌번호를 정확히 입력해주세요.\n\n계좌번호는 \'=계좌\'로 확인할 수 있습니다.');
      return;
    }
    if (Object.keys(정보).find(v => 정보[v][20] == account.replace(/(\d+?)((?=(?:\d{3})+(?!\d)))/g, "$1-$2")) == sender) {
      replier.reply('오류 : 본인에게는 송금할 수 없습니다.\n\n송금할 대상의 계좌번호를 입력해주세요.');
      return;
    }
    if (isNaN(parseInt(msg.slice(3).trim().replace(/[^0-9]/g, '').slice(9).trim()))) {
      replier.reply('오류 : 숫자가 올바르지 않습니다.\n\n송금하려는 금액을 정확하게 입력해주세요.');
      return;
    }
    if (sender_info[1] < parseInt(msg.slice(3).trim().replace(/[^0-9]/g, '').slice(9).trim())) {
      replier.reply('오류 : 돈이 부족합니다.\n\n송금하려는 금액을 정확하게 입력해주세요.');
      return;
    }
    if (홀짝경영자 == sender && sender_info[1] - 1000000 < parseInt(msg.slice(3).trim().replace(/[^0-9]/g, '').slice(9).trim())) {
      replier.reply('오류 : 경영자금이 부족합니다.\n\n현금은 최소한 100만원을 보유해야 합니다.');
      return;
    }
    정보[sender][1] -= parseInt(msg.slice(3).trim().replace(/[^0-9]/g, '').slice(9).trim());
    정보[Object.keys(정보).find(v => 정보[v][20] == account.replace(/(\d+?)((?=(?:\d{3})+(?!\d)))/g, "$1-$2"))][1] += parseInt(msg.slice(3).trim().replace(/[^0-9]/g, '').slice(9).trim());
    saveInfo();
    replier.reply(Object.keys(정보).find(v => 정보[v][20] == account.replace(/(\d+?)((?=(?:\d{3})+(?!\d)))/g, "$1-$2")) + '님에게 ' + SplitNum(parseInt(msg.slice(3).trim().replace(/[^0-9]/g, '').slice(9).trim())) + '원을 송금했습니다.');
  }
  try {
    if (msg.indexOf("=조회") == 0) {
      if (((new Date() - new Date(시스템[2])) / 1000) > 10 || sender == Searcher) {
        조회목록 = [];
        Searcher = null;
      } else {
        replier.reply("오류 : 누군가 조회시스템을 이용중입니다.\n\n현재 " + Searcher + "님이 조회중입니다.\n" + parseInt(10 - ((new Date() - new Date(시스템[2])) / 1000)) + "초만 기다려주세요.");
        return;
      }
      조회목록 = [];
      var U_L = Object.keys(정보);
      for (i = 0; i < U_L.length; i++) {
        if (U_L[i].match(RegExp(msg.slice(3).trim(), "gi")) != null) {
          if (msg.slice(3).trim() != "") {
            조회목록.push(U_L[i]);
          }
          if (!/[가-힣A-Za-z]/.test(U_L[i])) {
            조회목록.push(U_L[i]);
          }
        }
      }
      if (조회목록.length == 0) {
        replier.reply("오류 : 존재하지 않는 사용자입니다.\n\n검색을 시도할때에는 확실한 부분만 입력해주세요.\n대상의 이름이 입력하기 어렵다면 '=조회'만 입력해주세요.");
        return;
      }
      if (조회목록.length == 1) {
        내정보(조회목록[0]);
        return;
      }
      var zohoe = [];
      for (i = 0; i < 조회목록.length; i++) {
        zohoe.push((i + 1) + " : " + 조회목록[i]);
      }
      replier.reply(zohoe.join("\n") + "\n\n대상을 선택해주세요.");
      Searcher = sender;
      시스템.substitute(2, new Date());
      save("건아시스템", "건아시스템", JSON.stringify(시스템));
    }
    if (Searcher != null && sender == Searcher && !isNaN(msg) && ((new Date() - new Date(시스템[2])) / 1000) < 10) {
      if (조회목록.length < parseInt(msg) || parseInt(msg) < 1) {
        var zohoe = [];
        for (i = 0; i < 조회목록.length; i++) {
          zohoe.push((i + 1) + " : " + 조회목록[i]);
        }
        replier.reply(zohoe.join("\n") + "\n\n대상을 선택해주세요.");
        return;
      }
      내정보(조회목록[parseInt(msg) - 1]);
      조회목록 = [];
      Searcher = null;
      시스템.substitute(2, "Sun Feb 23 2020 15:25:57 GMT+0900 (GMT+09:00)");
      save("건아시스템", "건아시스템", JSON.stringify(시스템));
    }
  } catch (e) {
    replier.reply("오류 : 확인되지 않은 오류입니다.\n\n다시 시도해주세요.");
    조회목록 = [];
    Searcher = null;
    시스템.substitute(2, "Sun Feb 23 2020 15:25:57 GMT+0900 (GMT+09:00)");
    save("건아시스템", "건아시스템", JSON.stringify(시스템));
  }
  if (msg.startsWith("=홀") || msg.startsWith("=짝")) {
    if (sender_info == null || mfeat == null) {
      replier.reply("오류 : 정보가 올바르지 않습니다. \n\n'=내정보'로 정보를 확인해주세요.");
      return;
    }
    if (sender == 홀짝경영자) {
      replier.reply("오류 : 소유중인 서비스는 이용 할 수 없습니다.\n\n소유한 서비스를 이용하려면 소유권을 이전해주세요.");
      return;
    }
    var Dprice = parseInt(msg.slice(2).trim());
    if (['최대', 'Max', '올인', 'm'].includes(msg.slice(2).trim())) {
      Dprice = Math.ceil(총자산(sender) / 2)
    }
    if (isNaN(Dprice)) {
      replier.reply("오류 : 숫자가 올바르지 않습니다.\n\n액수를 입력할땐 숫자만을 사용해주세요.\n\n예시 ) '=홀 5000'");
      return;
    }
    if (Dprice > sender_info[1]) {
      replier.reply("오류 : 돈이 부족합니다.\n\n'=출석'으로 매일 보상을 받으세요.");
      return;
    }
    if (Dprice < 100) {
      replier.reply("오류 : 액수가 너무 적습니다.\n\n최소 100원보단 많이 입력해야 합니다.");
      return;
    }
    if (Dprice > Math.ceil(총자산(sender) / 2)) {
      replier.reply("오류 : 액수가 너무 큽니다.\n\n최대 총자산의 반절만을 입력할 수 있습니다.\n사용가능 금액 : " + SplitNum(Math.ceil(총자산(sender) / 2)) + "₩");
      return;
    }
    if (총자산(홀짝경영자) < Dprice) {
      replier.reply("회사의 돈이 부족합니다.\n" + 홀짝경영자 + "에게 문의하세요.");
      return;
    }
    if (총자산(홀짝경영자) > Dprice && 정보[홀짝경영자][1] < Dprice) {
      var stock = JSON.parse(read("건아시스템", "주식"));
      for (sti = 0; sti < 7; sti++) {
        if (정보[홀짝경영자][12 + sti] > 0) {
          var mts = Math.ceil(정보[홀짝경영자][12 + sti] - ((stock[Object.keys(stock)[sti]] * 정보[홀짝경영자][12 + sti] - (Dprice - 정보[홀짝경영자][1])) / stock[Object.keys(stock)[sti]]));
          정보[홀짝경영자][1] += (stock[Object.keys(stock)[sti]] * mts);
          정보[홀짝경영자][12 + sti] -= mts;
        }
      }
    }
    var daily = JSON.parse(read("건아시스템", "시간"));
    if (daily[sender] == null) {
      daily.make(sender, daily_make);
    } else if (new Date(daily[sender][2]).getDate() != new Date().getDate()) {
      daily[sender].substitute(2, new Date());
      daily[sender].substitute(3, 0);
    }
    if (daily[sender][3] > 2) {
      var extra_time = (new Date((Math.floor(new Date() / 86400000) * 86400000) + 54000000) - new Date()) / 60000;
      replier.reply("오류 : 오늘의 기회를 모두 사용했습니다.\n\n내일 다시 시도해주세요.\n남은 시간 ⎼⎼⎼ " + Math.floor(extra_time / 60) + "시간 " + Math.floor((extra_time % 60) + 1) + "분");
      return;
    }
    var hjmoney = Dprice * 2;
    var hjfeat = '홀짝 성공';
    var hjmsg = ['! 축하합니다.', '지급됨.'];
    var hjmsg2 = msg.substr(1, 1);
    var hjobj = {
      '홀': '짝',
      '짝': '홀'
    };
    if (Math.floor(Math.random() * 2) == 1) {
      hjmoney = Dprice;
      hjfeat = '홀짝 실패';
      hjmsg = ['.', '지불함.'];
      hjmsg2 = hjobj[hjmsg2];
      Dprice = Dprice * -1;
    }
    업적[sender][hjfeat]++;
    sender_info.substitute(1, sender_info[1] + Dprice);
    정보[홀짝경영자].substitute(1, 정보[홀짝경영자][1] - Dprice);
    daily[sender][3] += 1;
    replier.reply(hjmsg2 + hjmsg[0] + "\n" + SplitNum(hjmoney) + "원 " + hjmsg[1]);
    saveInfo();
    save("건아시스템", "시간", JSON.stringify(daily));
  }
  if (msg == "=출석") {
    if (sender_info == null || mfeat == null) {
      replier.reply("오류 : 정보가 올바르지 않습니다. \n\n'=내정보'로 정보를 확인해주세요.");
      return;
    }
    var daily = JSON.parse(read("건아시스템", "시간"));
    if (daily[sender] == null) {
      daily.make(sender, daily_make);
    } else if (new Date(daily[sender][0]).getDate() != new Date().getDate()) {
      daily[sender].substitute(0, new Date());
    } else {
      var nowd = new Date();
      replier.reply("오류 : 오늘은 이미 출석을 했습니다.\n\n내일 다시 시도해주세요.\n남은 시간 ⎼⎼⎼ " + Timeleft(new Date(nowd.getFullYear(), nowd.getMonth(), nowd.getDate() + 1, 00, 00, 00))[0]);
      return;
    }
    var price;

    function probability(provalt) {
      if (Math.ceil(Math.random() * 10000000) / 100000 < provalt) {
        return true;
      }
      return false;
    }
    if (probability(100)) {
      price = 2500;
    }
    if (probability(30)) {
      price = 5000;
    }
    if (probability(15)) {
      price = 12500;
    }
    if (probability(10)) {
      price = 17500;
    }
    if (probability(5)) {
      price = 25000;
    }
    if (probability(2.5)) {
      price = 37500;
    }
    if (probability(1)) {
      price = 50000;
    }
    if (probability(0.5)) {
      price = 75000;
    }
    if (probability(0.1)) {
      price = 100000;
    }
    if (probability(0.01)) {
      price = 250000;
    }
    if (probability(0.001)) {
      price = 5000000;
    }
    if (probability(0.0001)) {
      price = 10000000;
    }
    if (probability(0.00001)) {
      price = 100000000;
    }
    var price_name = "출석";
    if (sender == "생일지남") {
      price_name = "생일";
      price = 500000;
    }
    replier.reply(price_name + " 보상으로 " + SplitNum(price) + "원을 받았습니다.");
    업적[sender]['출석 횟수']++;
    업적[sender]['출석으로 받은 돈'] += price;
    sender_info.substitute(1, sender_info[1] + price);
    saveInfo();
    save("건아시스템", "시간", JSON.stringify(daily));
  }
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
  if (msg.indexOf("=가격") == 0) {
    msg = msg.slice(3).trim();
    var 검색결과;
    var 이름;
    try {
      검색결과 = Utils.getWebText("https://store.steampowered.com/search/?term=" + msg).split("<div class=\"responsive_search_name_combined\">")[1].split("<div style=\"clear: left;\">")[0].split("<div class=\"col search_price  responsive_secondrow\">")[1].split("</div>")[0].trim();
    } catch (e) {
      try {
        검색결과 = Utils.getWebText("https://store.steampowered.com/search/?term=" + msg).split("<div class=\"responsive_search_name_combined\">")[1].split("<div style=\"clear: left;\">")[0].split("<strike>")[1].split("</div>")[0].replace(/(<[^>]+>)/g, "").trim().replace(/  /g, "").replace("\n", "").split("\n");
      } catch (e) {
        replier.reply("검색결과가 없습니다.\n" + e);
        return;
      }
    }
    이름 = Utils.getWebText("https://store.steampowered.com/search/?term=" + msg).split("<div class=\"responsive_search_name_combined\">")[1].split("<div style=\"clear: left;\">")[0].split("<span class=\"title\">")[1].split("</span>")[0];
    var 할인결과 = [];
    if (검색결과.length == 2) {
      var 할인률 = Utils.getWebText("https://store.steampowered.com/search/?term=" + msg).split("<div class=\"responsive_search_name_combined\">")[1].split("<div style=\"clear: left;\">")[0].split("<div class=\"col search_discount responsive_secondrow\">")[1].split("<span>")[1].split("</span>")[0];
      for (i = 0; i < 2; i++) {
        if (i == 0) {
          할인결과.push("" + 검색결과[i] + " [ -0% ]");
        } else {
          할인결과.push("" + 검색결과[i] + " [ " + 할인률 + " ]");
        }
      }
      검색결과 = 할인결과.join("\n");
    } else {
      검색결과 = 검색결과 + " [ -0% ]";
    }
    검색결과 = 검색결과.replace(/free to play/gi, "무료");
    if (검색결과 == " [ -0% ]") {
      검색결과 = "미출시";
    }
    replier.reply(이름 + "의 가격을 불러올게요!\n\n" + 검색결과);
  }
  if (msg == "=기포") {
    Kakao.sendLink(room, {
      "link_ver": "4.0",
      "template_id": 43852
    }, "custom");
  }
  if (room == '건전한 아이들' && msg.replace(/[^가-힣]/g, '').length > 1 && JSON.parse(read('건아시스템', '종결어미')).includes(msg.replace(/[^가-힣]/g, '').substr(msg.replace(/[^가-힣]/g, '').length - 1, 1))) {
    replier.reply(msg.replace(/[^가-힣]/g, '').substr(msg.replace(/[^가-힣]/g, '').length - 1, 1) + '?'.repeat(Math.floor(Math.random() * 10) + 1))
  }
  if (msg.startsWith("기포")) {
    if (msg.endsWith("야") || msg.endsWith("아") || msg.length == 2) {
      var gipo = ["네, 부르셨나요?", "네, 기포에요.", "무슨 일이신가요?", "네, 기포입니다.", "네, 무엇을 원하시나요?", "네, 말씀해주세요.", "김형근 병신"];
      var r = Math.floor(Math.random() * gipo.length);
      replier.reply(gipo[r]);
      if (called.includes(sender)) {
        var ct = called[called.indexOf(sender) + 1];
        called.remove(sender);
        called.remove(called[called.indexOf(sender) + 1]);
        if (((new Date() - new Date(ct)) / 1000) > 15) {
          return;
        }
      }
      called.push(sender);
      called.push(new Date());
    }
  }
  if (msg.match(/(안녕|반가워|하이|헬로|안뇽|ㅎㅇ|반갑다|반갑노|안녕하노|노무현)$/) && (called.indexOf(sender) != -1 || msg.indexOf("기포") == 0)) {
    var gipo = ["안녕하세요.", "안녕하세요, 기포에요.", "안녕하세요, 무엇을 원하시나요?", "안녕하세요, 전 기포에요.", "반가워요, 기포에요.", "안녕하세요, 무엇을 도와드릴까요?", "네, 안녕하세요."];
    var r = Math.floor(Math.random() * gipo.length);
    replier.reply(gipo[r]);
  }
  if (called.indexOf(sender) != -1 || msg.indexOf("기포") == 0) {
    if (msg.match(/(코로나|확진자|감염자)/) && msg.replace(/ /g, "").replace("?", "").match(/(보여줘|몇명이야|알려줘|구해줘|코로나|확진자|감염자|몇명|몇명임|몇명이노|몇명이누|몇이노)$/)) {
      if (called.indexOf(sender) != -1) {
        var ct = called[called.indexOf(sender) + 1];
        called.remove(sender);
        called.remove(called[called.indexOf(sender) + 1]);
        if (((new Date() - new Date(ct)) / 1000) > 15) {
          return;
        }
      }
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

  if (msg.startsWith('=계산')) {
    var calculated = JSON.parse(Jsoup.connect('https://m.search.naver.com/p/csearch/content/qapirender.nhn?_callback=window.__jindo2_callback._calculate_0&where=nexearch&pkid=69&q=' + encodeURIComponent(msg.slice(3).trim()) + '&p9=0').ignoreContentType(true).execute().body().match(/\((.*?)\)/)[1])['result']
    replier.reply(calculated['status'] == 'success' ? calculated['value'] : '계산 실패')
  }

  if (msg.startsWith("=국밥계산")) {
    msg = msg.slice(5).trim();
    if (isNaN(msg)) {
      replier.reply("숫자를 입력해주세요.");
      return;
    }
    replier.reply(((parseInt(msg) / 5600).toFixed(1) + "국밥").replace(".0", ""));
  }
  if (['=업다운', '업다운', 'ㅇㄷㅇ'].includes(msg)) {
    replier.reply('업다운 게임은 카카오톡 개인 메시지에서만 이용 가능합니다.');
  }
  if (msg == "Test1") {
    Kakao.sendLink(room, {
      'link_ver': '4.0',
      'template_id': 43644,
      'template_args': {
        'name': '《보유 스킬》',
        'money': '팟 호!',
        'level': '머리카락에 폭발피해.',
        'image': 'https://blogfiles.pstatic.net/MjAyMTAyMTZfMTgy/MDAxNjEzNDg1NjY0OTAx.ml3wPFOBBU9WEEgLrhZA9_zezbJnw4D3ZiaV-UrkKcIg.uTUBQM1hcNd-4LA5asWBajDwHQ1mXiTeCCsKYIZ6njYg.PNG.leess0410/16CCF033-D0D0-4E94-B36C-AB4EB22F6B6A.png?type=w3',
        'line': '초콜릿 두 개',
        'stock': '광역스턴과 김재형 처형.',
        'image2': 'https://blogfiles.pstatic.net/MjAyMTAyMTZfMjY0/MDAxNjEzNDg2NTQzNjgz.v4IoGVX5jiFy9YXsxuNW9jm2g7PzTycpgNWUGTjITzwg.Z9o7ipT5825fkdLgDQ1dEckmSjFnvPeFn7jSXbV5WyUg.PNG.leess0410/30D9013F-D3B8-4816-8CF0-C497EE06E37A.png?type=w3'
      }
    }, 'custom');
  }
  if (msg.startsWith('=게시글')) {
    var gg = JSON.parse(read('건아시스템', '게시글'));
    if (['', '목록'].includes(msg.slice(4).trim())) {
      replier.reply(Object.keys(gg).reverse().division(10)[0].map((v, i, a) => {
        return (i + 1) + '| [일반] ' + v;
      }).join('\n'));
      return;
    }
    if (Object.keys(gg).includes(msg.slice(4).trim())) {
      replier.reply('[일반] ' + msg.slice(4).trim() + '\n\n' + gg[msg.slice(4).trim()]);
    }
    if (!isNaN(msg.slice(4).trim())) {
      if (gg[Object.keys(gg).reverse()[parseInt(msg.slice(4).trim()) - 1]] != null) {
        replier.reply('[일반] ' + Object.keys(gg).reverse()[parseInt(msg.slice(4).trim()) - 1] + '\n\n' + gg[Object.keys(gg).reverse()[parseInt(msg.slice(4).trim()) - 1]]);
      }
    }
    msg = '=' + msg.slice(4).trim();
  }
  if (msg.startsWith('=작성')) {
    var gg = JSON.parse(read('건아시스템', '게시글'));
    var mg = msg.slice(3).trim().split('//');
    if (mg.length != 2) {
      replier.reply('오류 : 제목과 내용을 구분해주세요.\n\n제목과 내용은 //로 구분합니다.\n예시 ) \'=게시글 작성 제목//내용\'');
      return;
    }
    if (Object.keys(gg).includes(mg[0])) {
      replier.reply('오류 : 이미 존재하는 글 제목입니다.\n\n글의 제목이 중복되지 않도록 해주세요.');
      return;
    }
    gg[mg[0]] = mg[1];
    save('건아시스템', '게시글', JSON.stringify(gg));
    replier.reply('게시글이 저장되었습니다.');
  }
  if (msg.startsWith('=삭제')) {
    var gg = JSON.parse(read('건아시스템', '게시글'));
    if (!Certified) {
      replier.reply('자신의 글이 아닙니다.');
      return;
    }
    if (Object.keys(gg).includes(msg.slice(3).trim())) {
      delete gg[msg.slice(3).trim()];
      save('건아시스템', '게시글', JSON.stringify(gg));
      replier.reply('게시글을 삭제했습니다.');
      return;
    }
    if (!isNaN(msg.slice(3).trim())) {
      if (gg[Object.keys(gg).reverse()[parseInt(msg.slice(3).trim()) - 1]] != null) {
        delete gg[Object.keys(gg).reverse()[parseInt(msg.slice(3).trim()) - 1]];
        save('건아시스템', '게시글', JSON.stringify(gg));
        replier.reply('게시글을 삭제했습니다.');
        return;
      }
    }
    replier.reply('존재하지 않는 게시글입니다.');
  }
  if (msg.startsWith('EditCrops') && Certified) {
    save('건아시스템', 'crops', msg.slice(9).trim());
    replier.reply('done.');
  }
  String.prototype.removeTag = function () {
    var res = this;
    res = res.replace(/<br>/g, "\n");
    res = res.replace(/<[^<>]*>/g, "");
    var specialTag = ["&lt;", "<", "&gt;", ">", "&quot;", "\"", "&acute;", "'", "&#45;", "-", "&#44;", ",", "&#40;", "(", "&#41;", ")", "&#124;", "￦", "&#nbsp;", " ", "&amp;", "&"];
    for (var i = 0; i < specialTag.length; i += 2) {
      res = res.replaceAll(specialTag[i], specialTag[i + 1]);
    }
    res = res.replace(/\n[ \t\r][ \t\r]+/g, "\n");
    res = res.replace(/\n\n\n+/g, "\n\n");
    return res;
  };

  function Timeleft(targetTime) {
    return [(' ' + parseInt((targetTime.getTime() - new Date().getTime()) / (1000 * 60 * 60)) + '시간 ' + Math.ceil((targetTime.getTime() - new Date().getTime()) % (1000 * 60 * 60) / (1000 * 60)) + '분').replace(' 0시간', '').replace('60분', '59분').trim(), targetTime > new Date()];
  }

  function append_seizure(str) {
    var seizure_list = JSON.parse(read('건아시스템', '종결어미'))
    seizure_list.push(str)
    save('건아시스템', '종결어미', JSON.stringify(seizure_list))
  }

  function toNumber(count) {
    count = (count == undefined) ? 0 : count;
    return count;
  }

  function SplitNum(value) {
    value = (typeof value !== 'undefined') ? value : 0;
    return value.toString().replace(/(\d+?)((?=(?:\d{3})+(?!\d)))/g, "$1,$2");
  }

  function saveInfo() {
    save("건아시스템", "정보", JSON.stringify(정보));
    save("건아시스템", "업적", JSON.stringify(업적));
  }

  function count_exp(lv) {
    return Math.round(((Math.round(lv) + Math.round('1' + '0'.repeat(lv.toString().length - 1))) * 1000) * ('1.' + (Math.round(lv).toString().slice(Math.round(lv).toString().length - 1))));
  }

  function add_exp(who, count) {
    정보[who][3] += count;
    if (count_exp(정보[who][2]) > 정보[who][3]) {
      saveInfo();
      return;
    }
    var lvlup = 0;
    while (count_exp(정보[who][2]) <= 정보[who][3]) {
      정보[who][3] -= count_exp(정보[who][2]);
      정보[who][2]++;
      lvlup++;
    }
    replier.reply('레벨이 ' + lvlup + '올랐습니다!\n현재 레벨 : ' + 정보[who][2]);
    saveInfo();
    return;
  }

  function stock_update(force) {
    force = (typeof force !== 'undefined') ? force : parseInt((new Date() - new Date(시스템[1])) / 600000);
    var stock = JSON.parse(read("건아시스템", "주식"));
    for (is = 0; is < Object.keys(stock).length; is++) {
      for (a = 0; a < force; a++) {
        if (stock[Object.keys(stock)[is]] != 9990999) {
          var stockpm = Math.ceil(stock[Object.keys(stock)[is]] * parseFloat("0.00" + Math.floor(Math.random() * 2).toString() + Math.floor(Math.random() * 10).toString()));
          if (Math.floor(Math.random() * 2) < 1) {
            stockpm = stockpm * -1 * 0.95;
          }
          stock.make(Object.keys(stock)[is], parseInt(stock[Object.keys(stock)[is]] + stockpm));
          if (parseInt(stock[Object.keys(stock)[is]]) < 11) {
            for (u = 0; u < Object.keys(정보).length; u++) {
              정보[Object.keys(정보)[u]][1] += parseInt(정보[Object.keys(정보)[u]][12 + is] * 10);
              정보[Object.keys(정보)[u]].substitute(12 + is, 0);
            }
            stock.make(Object.keys(stock)[is], 9990999);
          }
        }
      }
    }
    if (parseInt((new Date() - new Date(시스템[1])) / 600000) > 0) {
      시스템.substitute(1, new Date(parseInt((new Date().getTime()) / 600000) * 600000));
    }
    saveInfo();
    save("건아시스템", "주식", JSON.stringify(stock));
    save("건아시스템", "건아시스템", JSON.stringify(시스템));
  }

  function 총자산(who) {
    if (정보[who] == null) {
      return null;
    }
    stock_update();
    var stock = JSON.parse(read("건아시스템", "주식"));
    var chongza = 정보[who][1];
    for (i = 0; i < 7; i++) {
      chongza += 정보[who][12 + i] * stock[Object.keys(stock)[i]];
    }
    return chongza;
  }

  function 내정보(who) {
    if (정보[who] == null) {
      return null;
    }
    stock_update();
    var stock = JSON.parse(read("건아시스템", "주식"));
    var arro = [];
    for (i = 0; i < Object.keys(stock).length; i++) {
      if (정보[who][12 + i] != 0) {
        arro.push(Object.keys(stock)[i] + " " + 정보[who][12 + i]);
      }
    }
    var resultes = {};
    arro.map(s => {
      var a = s.match(/(.+) (\d+)/);
      if (!resultes[a[2]])
        resultes[a[2]] = [];
      resultes[a[2]].push(a[1]);
    });
    var totol = " ";
    for (ii = 0; ii < 7; ii++) {
      if (정보[who][12 + ii] != 0) {
        totol = "￣￣￣￣￣￣￣￣￣￣";
        break;
      }
    }
    var jar = [];
    for (iar = 0; iar < Object.keys(resultes).length; iar++) {
      if (jar.length < 2) {
        jar.push(resultes[Object.keys(resultes).reverse()[iar]] + " ] " + SplitNum(Object.keys(resultes).reverse()[iar]) + "주");
      }
    }
    var image_url = tier[5];
    try {
      switch (jar.length) {
        case 0:
          json = {
            'link_ver': '4.0',
            'template_id': 43599,
            'template_args': {
              'name': (정보[who][0] + ' (' + who + ')').replace(('default (' + who + ')'), who),
              'money': '(총자산 : ' + SplitNum(총자산(who)) + ') ' + SplitNum(정보[who][1]) + '₩',
              'level': '레벨 : ' + 정보[who][2] + '  경험치 : ' + 정보[who][3] + '/' + count_exp(정보[who][2]),
              'image': image_url
            }
          };
          break;
        default:
          json = {
            'link_ver': '4.0',
            'template_id': 43644,
            'template_args': {
              'name': (정보[who][0] + ' (' + who + ')').replace(('default (' + who + ')'), who),
              'money': '(총자산 : ' + SplitNum(총자산(who)) + ') ' + SplitNum(정보[who][1]) + '₩',
              'level': '레벨 : ' + 정보[who][2] + '  경험치 : ' + 정보[who][3] + '/' + count_exp(정보[who][2]),
              'image': image_url,
              'line': totol,
              'stock': jar.join('  ')
            }
          };
          break;
      }
      Kakao.sendLink(room, json, 'custom');
    } catch (e) {
      replier.reply(e)
      Api.off();
    }
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