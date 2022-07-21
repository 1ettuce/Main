const scriptName = "Edit Main";
Jsoup = org.jsoup.Jsoup;

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
  msg = msg.trim();
  sender = sender.trim().replace("~#~", "");

  try {
    if (msg.startsWith("code.") && sender == '이상수') {
      replier.reply(room, eval(msg.slice(5).trim()));
    }
  } catch (e) {
    replier.reply("an  " + e.name + "  occurred.\n: " + e.message);
  }

  Date.prototype.Time = function () {
    return this.getFullYear() + '-' + (this.getMonth() + 1) + '-' + this.getDate() + '  ' + this.getHours() + ':' + this.getMinutes() + ':' + this.getSeconds();
  }

  function get(url) {
    url = url == null ? 'https://github.com/1ettuce/Main/blob/main/Main.js' : url
    if (!/^https?:\/\/github.com/.test(url))
      throw new Error('Invalid  URL.');
    const Code_ = Jsoup.connect(url.replace('/blob/', '/raw/')).ignoreHttpErrors(true).execute();
    const Version_ = Jsoup.connect('https://github.com/1ettuce/Main/commits/main/Main.js').get().select('#repo-content-pjax-container > div > div.js-navigation-container.js-active-navigation-container.mt-3 > div.TimelineItem.TimelineItem--condensed.pt-0.pb-2 > div.TimelineItem-body > ol > li:nth-child(1) > div.flex-auto.min-width-0.js-details-container.Details > p > a').text();
    if (!Code_.header('content-length'))
      throw new Error('Invalid  URL.');
    return [Version_, Code_.body()];
  };

  function apply(url) {
    if (FileStream.read('/sdcard/msgbot/Bots/Main/Main.js') == get(url)[1])
      throw new Error('No  changes.');
    FileStream.write('/sdcard/msgbot/Bots/Main/Backup/' + new Date().Time() + '.js', FileStream.read('/sdcard/msgbot/Bots/Main/Main.js'));
    FileStream.write('/sdcard/msgbot/Bots/Main/Main.js', get(url)[1]);
    FileStream.write('/sdcard/msgbot/Bots/Main/Version.txt', get(url)[0]);
    return Api.reload('Main'), 'Successfully  applied.';
  };
}