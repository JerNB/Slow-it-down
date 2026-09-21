export const IDEAS = [
 ['make','做一个只属于你的小项目','网站、歌单、小相册，挑一个你真的想做的。','写下这个小项目最让你期待的地方。'],
 ['breakfast','给自己准备一顿喜欢的早餐','简单一点也可以，选你喜欢的味道。','想一想现在能吃到、也想吃的一样东西。'],
 ['home','重现一点家里的味道','一道菜、一杯茶，或问问家人他们的做法。','挑一个熟悉的味道，找出做它需要的第一样东西。'],
 ['photo','拍下三种同样的颜色','在身边找找看，不必拍得漂亮。','选一种今天喜欢的颜色，先找到第一个。'],
 ['playlist','给今天做一张小歌单','三首就够，跟着自己的喜好选。','放一首你现在想听的歌，把它加进新歌单。'],
 ['window','把早晨的光放进来','拉开窗帘，在窗边待一小会儿。','走到窗边，看看外面有什么正在动。'],
 ['corner','腾出桌上的一小块地方','只整理一个角落，不用收拾整个房间。','把手边三样东西放回你想放的位置。'],
 ['postcard','寄出一张真实的明信片','把异乡的一小片日常，送给惦记的人。','想一个收件人，写下想告诉对方的第一句话。'],
 ['walk','给散步找一个小目的地','一棵树、一家面包店，或校园里安静的角落。','选一个方便、安全的地方，按自己的体力走走。'],
 ['library','在图书馆随缘翻一本书','从感兴趣的书架开始，不必读完。','找一本让你好奇的书，先看看目录。'],
 ['friend','发出一个具体的小邀请','“明天一起吃午饭吗？”比等一个时机容易一点。','想一个愿意见的人，问问对方什么时候方便。'],
 ['call','听听一个熟悉的声音','可以是朋友、家人，或让你安心的人。','先发一句：“你这几天方便打个电话吗？”'],
 ['share','把今天的一件小事告诉别人','好笑的、普通的，都值得分享。','挑一张照片或一件小事，发给你想到的人。'],
 ['future','给未来的自己写张便签','留一句以后还想看见的话。','以“如果那天有点难过……”开头，写一句话。'],
 ['draw','随手画一个眼前的东西','不需要会画画，歪歪扭扭也可以。','找一支笔，描一下杯子或窗户的轮廓。'],
 ['curious','追一个小小的好奇心','去了解一个和作业无关的问题。','写下最近的一个“为什么”，找一篇介绍读读。'],
 ['campus','看看校园里有什么新鲜事','摄影、电影、徒步，找一项有点心动的活动。','打开学校活动页面，先收藏一个感兴趣的活动。'],
 ['plant','照顾身边的一点绿色','看看叶子、土壤，留意它最近的变化。','观察一株植物。如果自己养了，再看看是否需要照料。'],
 ['album','做一个“我喜欢这些”的相册','把让你有感觉的照片放在一起。','新建一个相册，放进第一张喜欢的照片。'],
 ['sunset','留一点时间看天空','不用特地远行，抬头就可以。','找个安全舒服的位置，看看云和光的颜色。'],
 ['letter','写一封暂时不寄出的信','给一个人，也可以给过去的自己。','写下最想说的一句话；是否保留，由你决定。'],
 ['museum','计划一次小小的出走','附近的展览、公园，或一个新街区。','找一个想去的地方，先看看开放时间，不急着出发。'],
 ['hands','让双手做点喜欢的事','折纸、拼图、烘焙，想起什么就试试。','选一件手边能做的事，准备第一样材料。'],
 ['nothing','给自己一段不用交代的时间','听一首歌，或安静坐着，也可以。','找个舒服的位置，把“我应该”暂时放在一边。']
].map(([id,title,desc,step])=>({id,title,desc,step}));

// Brief quotations verified against the linked source; Chinese translations are ours.
export const BOOKS = [
 {id:'time',title:'四千周',original:'Four Thousand Weeks',author:'奥利弗·伯克曼',color:'sage',quote:'The day will never arrive when you finally have everything under control',translation:'你终于能把一切都掌控好的那一天，永远不会到来。',source:'https://cdn.penguin.co.uk/dam-assets/books/9781784704001/9781784704001-sample.pdf',sourceLabel:'出版社试读 · 导言，第 13 页（节选）',about:'重新看看“必须把所有事情做完”的期待，把有限的时间留给自己重视的事。',start:'先读导言。读到有共鸣的地方就停，不必立刻制定新计划。'},
 {id:'comfort',title:'给自己一个拥抱，给希望一点时间',original:'The Comfort Book',author:'马特·海格',color:'peach',quote:"You don't have to continually improve yourself to love yourself.",translation:'你不必不停地改善自己，才可以爱自己。',source:'https://penguinrandomhouselibrary.com/book/?isbn=9780143136668',sourceLabel:'出版社试读 · You Are the Goal',about:'由短篇随笔与片段组成，适合不想读很多、只想有人陪一会儿的时候。',start:'先读“You Are the Goal”这一小节。一段也算一次阅读。'},
 {id:'self',title:'自我关怀的力量',original:'Self-Compassion',author:'克里斯汀·内夫',color:'sand',quote:'Self-compassion in no way lowers where you set your sights in life.',translation:'善待自己，并不会让你降低对人生的追求。',source:'https://giveyourselfkindness.com/blogs/wellness/self-compassion-learning-and-personal-growth',sourceLabel:'作者授权书摘 · 学习与个人成长',about:'讨论如何面对自己的不足和自我批评，也包含可尝试的练习。',start:'从书中谈自我批评的部分开始，留意你平常怎样和自己说话。'},
 {id:'gifts',title:'不完美的礼物',original:'The Gifts of Imperfection',author:'布琳·布朗',color:'rose',quote:'Owning our story and loving ourselves through that process is the bravest thing that we’ll ever do.',translation:'接纳自己的故事，并在这个过程中爱自己，是我们所能做的最勇敢的事。',source:'https://brenebrown.com/podcast/brene-with-ashley-and-barrett-for-the-summer-sister-series-on-the-gifts-of-imperfection-part-1-of-6/',sourceLabel:'作者读书会 · 序言引句',about:'围绕不完美、归属感和真实的自己展开，适合总在比较、担心不够好时慢慢读。',start:'先读序言。试着把某个“我必须”留在纸上，看一看它来自哪里。'},
 {id:'let',title:'随他们去',original:'The Let Them Theory',author:'梅尔·罗宾斯',color:'sage',quote:'There is a second, even more crucial step to this theory: Let Me.',translation:'这个理论还有第二步，而且更关键：让我来。',source:'https://www.cbsnews.com/news/book-excerpt-the-let-them-theory-by-mel-robbins/',sourceLabel:'CBS 刊载的正式书摘',about:'从他人的反应回到自己的选择。不是停止沟通，而是分清自己能做什么。',start:'把“Let Them”和“Let Me”一起读，再想一件由你决定的事。'},
 {id:'prince',title:'小王子',original:'The Little Prince',author:'安托万·德·圣埃克苏佩里',color:'sand',quote:'It is only with the heart that one can see rightly; what is essential is invisible to the eye.',translation:'用心才能看清；真正重要的，眼睛看不见。',source:'https://www.lepetitprince.com/en/',sourceLabel:'《小王子》官方网站 · 狐狸的秘密',about:'一则关于相遇、关系与告别的故事。适合想通过故事靠近自己感受的时候。',start:'可以从小王子与狐狸相遇的部分开始；也可以从第一页慢慢读。'}
];
export const QUOTES = [...BOOKS.map(b=>({bookId:b.id,text:b.translation,original:b.quote,source:b.source,label:b.sourceLabel})),{bookId:'comfort',text:'没有什么，比一份不肯放弃的小小希望更坚强。',original:"Nothing is stronger than a small hope that doesn't give up.",source:BOOKS[1].source,label:'出版社试读 · 短句'}];
export const CONCERNS=[['busy','事情太多，脑子很乱'],['self','总觉得自己不够好'],['relation','一段关系让我放不下'],['alone','有些孤单，想念熟悉的人']];
export const RECOMMENDATIONS={busy:{practical:'time',gentle:'comfort'},self:{practical:'self',gentle:'gifts'},relation:{practical:'let',gentle:'prince'},alone:{practical:'self',gentle:'comfort'}};
export const REASONS={busy:{practical:'你提到事情太多，也想换个看问题的角度。这本书可以陪你区分“重要的事”和“必须全做完”的压力。',gentle:'你现在更想轻轻读一点。这本书的短片段不要求你立刻整理好生活，可以随时开始、随时停下。'},self:{practical:'你提到对自己不够满意，也愿意试试练习。这本书的自我关怀视角，或许能帮你换一种和自己说话的方式。',gentle:'你更想获得理解，而不是再接一项任务。这本书围绕不完美与归属展开，可以从自己的共鸣处读起。'},relation:{practical:'你想从关系带来的牵挂里找回一点主动。这本书提供一个区分他人选择与自己行动的角度。',gentle:'你更想读一个故事。小王子与狐狸的相遇，可能让你更容易接近那些关于在意和告别的感受。'},alone:{practical:'你提到孤单，也愿意试着理解自己。这本书谈到共同的人类经验，可以作为自我关怀练习的起点。',gentle:'你想要一点陪伴感。这些短小的片段适合独处时随手翻开，不需要有足够精力读完一章。'}};

