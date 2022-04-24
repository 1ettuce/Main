const scriptName = "Edit Main";
Jsoup = org.jsoup.Jsoup
function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
  
	msg = msg.trim();
	sender = sender.trim().replace("~#~", "");
	try {
		if (msg.startsWith("/")&&sender == '이상수') {
		  replier.reply(room, eval(msg.slice(1)));
		}
	   }  catch (e) {
	   replier.reply("오류가 발생했어요\n\n오류 : " + e.name + " " + e.message);
	 }


function Code(){
	this.path = '/sdcard/msgbot/Bots/Main/Main.js';
}

  Code.prototype.get = function(url){
	if (!/^https?:\/\/github.com/.test(url))
	throw new Error('INVALID URL.');
	const Code_ = Jsoup.connect(url.replace('/blob/', '/raw/'))
	.ignoreHttpErrors(true).execute();
if (!Code_.header('content-length'))
	throw new Error('INVALID URL.');
return Code_.body();
  }	 

  
Code.prototype.apply = function(url){
	FileStream.write(this.path, this.get(url));
	replier.reply('SUCCESSFULLY APPLIED.');
	return Api.reload('Main');
}

  
  
}
