const scriptName = "Edit Main";
Jsoup = org.jsoup.Jsoup;

Date.prototype.Time = function () {
  return this.getFullYear() + '-' + (this.getMonth() + 1) + '-' + this.getDate() + '  ' + this.getHours() + ':' + this.getMinutes() + ':' + this.getSeconds();
}

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
  msg = msg.trim();
  sender = sender.trim().replace("~#~", "");

  try {
    if (msg.startsWith("code.") && sender == '이상수') {
      replier.reply(room, eval(msg.slice(5).trim()));
    }
  } catch (e) {
    replier.reply("an " + e.name + " occurred.\n: " + e.message);
  }

  function get(url) {
    if (!/^https?:\/\/github.com/.test(url))
      throw new Error('INVALID URL.');
    const Code_ = Jsoup.connect(url.replace('/blob/', '/raw/')).ignoreHttpErrors(true).execute();
    if (!Code_.header('content-length'))
      throw new Error('INVALID URL.');
    return Code_.body();
  };

  function apply(url) {
    FileStream.write('/sdcard/msgbot/Bots/Main/Backup/' + new Date().Time() + '.js', FileStream.read('/sdcard/msgbot/Bots/Main/Main.js'));
    FileStream.write('/sdcard/msgbot/Bots/Main/Main.js', get(url));
    return Api.reload('Main'), 'SUCCESSFULLY APPLIED.';
  };
}