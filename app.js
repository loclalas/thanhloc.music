
// 1. Render Song.                                              -> done.
// 2. Scroll Top.                                               -> done.
// 3. Play/Pause/Seek.                                          -> done.
// 4. CD Rotate.                                                -> done.
// 5. Next/Prev.                                                -> done.
// 6. Random.                                                   -> done.
// 7. Next/Repeat when ended.                                   -> done.
// 8. Active Song.                                              -> done.
// 9. Scroll active song into view.                             -> done.
// 10. Play song when click                                     -> done.


const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,

    songs: [
        {
            name: 'Tay To',
            singer: 'RPT MCK',
            path: "./assets/music/1_tayto.mp3",
            image: "./assets/img/1_tayto.jpg"
        },
        {
            name:'QLC',
            singer:'Hưng Cao',
            path:"./assets/music/2_qlc.mp3",
            image:"./assets/img/2_qlc.jpg"
        },
        {
            name: 'In The Night',
            singer:'Tuấn Cùi',
            path:"./assets/music/3_inthenight.mp3",
            image:"./assets/img/3_inthenight.jpg"
        },
        {
            name: 'Circles',
            singer: 'Post Malone',
            path: "./assets/music/4_cirrles.mp3",
            image:"./assets/img/4_cirrles.jpg"
        },
        {
            name:'Skyfall',
            singer:'Adele',
            path: "./assets/music/5_Skyfall.mp3",
            image:"./assets/img/5_Skyfall.png"
        }
    ],

    render: function(){
        const htmls = this.songs.map((song,index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active': ''}" data-index="${index}">
                 <div class="thumb" style="background-image: url('${song.image}')">
                 </div>
                 <div class="body">
                     <h3 class="title">${song.name}</h3>
                     <p class="author">${song.singer}</p>
                 </div>
                 <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                 </div>
            </div>
            `
        })
        playlist.innerHTML = htmls.join('');
    },

    defineProperties: function() {
        Object.defineProperty(this, 'currentSong',{
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },

    

    //Dùng để xử lý sự kiện
    handleEvent: function(){
        const _this = this;
        const cdWidth = cd.offsetWidth;

        //Xử lý việc CD quay:
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ],{
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause();

        //Soi phương thức của animate():
        // console.log(cdThumbAnimate)


        //Xử lý phóng to thu nhỏ:
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth 
            // ở đây không đổ bóng theo 1 số cụ thể, vì như thế nó sẽ đổ bóng ngay từ -> giải pháp: kéo đến đâu thì đổ bóng đến đấy, mà newCdWidth và 
            // cdWidth là chỉ số thay đổi theo việc scroll -> scroll đến đâu đổ bóng đến đấy theo tỉ lệ.
        
        }

        //Xử lý khi click play:
        playBtn.onclick = function(){
            if(_this.isPlaying){
                audio.pause();
            } else{
                audio.play();
            }
        }

        //Khi bài hát được phát:
        audio.onplay = function (){
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        audio.onpause = function (){
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }
        
        //Xử lý bấm sang bài sau/trước:
        nextBtn.onclick = function(){
            if(_this.isRandom){
                _this.randomSong();
            }else{
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        prevBtn.onclick = function(){
             if(_this.isRandom){
                _this.randomSong();
            }else{
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        //Xử lý khi chuyển nhạc random:
        randomBtn.onclick = function (){
            _this.isRandom = !_this.isRandom;
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        //Xử lý khi repeat:
        repeatBtn.onclick = function(){
            _this.isRepeat = !_this.isRepeat;
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }


        //Khi tiến độ bài hát thay đổi:
       audio.ontimeupdate = function(){
           if(audio.duration){
               const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
               progress.value = progressPercent;
           }
       }
        
       //Xử lý khi tua bài hát:
       progress.onchange = function(e){
           const seekTime = e.target.value / 100 * audio.duration 
           audio.currentTime = seekTime
       }

       //Xử lý bài hát tiếp theo khi kết thúc:
       audio.onended = function(){
           if(_this.isRepeat){
              audio.play();
           }else{
               nextBtn.click();
           }
       }

       //Lắng nghe hành vi click vào playlist:
       playlist.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)');

            if(songNode || e.target.closest('.option')){
                //Xử lý khi click song:
                if(songNode){
                    _this.currentIndex  = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }

                //Xử lý khi click song option:
                if(e.target.closest('.option')){

                }

            }
       }
    },

    scrollToActiveSong: function(){
        setTimeout(()=>{
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            })
        },200)
    },

    loadCurrentSong: function(){

        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },


    //Xử lý việc bấm sang bài tiếp theo/trước đó:
    nextSong: function(){
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    prevSong: function(){
        this.currentIndex--;
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length;
        }
        this.loadCurrentSong();
    },

    //Chuyển bài theo random:
    randomSong: function(){
        let newIndex
        do{
            newIndex = Math.floor(Math.random() * this.songs.length)
        }while(this.currentIndex === newIndex)

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    start: function(){
        //Định nghĩa các thuộc tính cho object:
        this.defineProperties()

        //Lắng nghe và xử lý các sự kiện:
        this.handleEvent()

        //Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng:
        this.loadCurrentSong()

        //Render Playlist:
        this.render()

    }
}
app.start()
