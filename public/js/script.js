(function() {
    Vue.component('modalicious', {
        data: function() {
            return {
                img: {
                    title: '',
                    username: '',
                    description: '',
                    url: '',
                    date: ''
                },
                txt: {
                    comment: '',
                    username: '',
                    id: ''
                },
                allComments: []
            };
        },
        methods: {
            exit: function(e) {
                this.$emit('close');
            },
            currentImg: function(e) {
                this.$emit('id');
            },
            commentSend: function(e) {
                e.preventDefault();
                let self = this;
                axios.post('/send-comments',
                    {comment: self.txt.comment, username: self.txt.username, img_id: self.id}
                ).then(res => {
                    self.allComments.unshift(res.data);
                    self.txt = {};
                });
            }
        },
        template: '#modal-template',
        props: ['id'],
        mounted: function() {
            var self = this;
            axios.get('/zoom-picture/'+this.id).then(function(res) {
                self.img = res.data;
                self.img.date = res.data.created_at.split('T').shift();
            }).catch(err => {
                console.log('ERRORRR: ', err);
            });

            axios.get('/get-comments/'+this.id).then(function(res) {
                self.allComments = res.data.reverse();
            }).catch(err => {
                console.log('ERRORRR: ', err);
            });
        }
    });

    new Vue({
        el: '#main',
        data: {
            currentImg: null || location.hash.slice(1),
            images: [],
            form: {
                title: '',
                username: '',
                description: '',
                file: null
            },
            morePics: true
        },
        mounted: function() {
            var self = this;
            axios.get('/get-images').then(function(res) {
                self.images = res.data;
                if (res.data.length < 5) {
                    self.morePics = false;
                } else {
                    var lastIndex = self.images.length -1;
                    var lastOfChunk = self.images[lastIndex].id;
                    if (lastOfChunk == 1) {
                        self.morePics = false;
                    }
                }
            }).catch(err => {
                console.log('ERRORRR: ', err);
            });
        },
        methods: {
            //Upload picture info and connect it to html//
            uploadFile: function(e) {
                e.preventDefault(); //Avoid to reload the page when we click the button (default behaviour)
                var formData = new FormData();
                formData.append('title', this.form.title);
                formData.append('description', this.form.description);
                formData.append('username', this.form.username);
                formData.append('file', this.form.file);
                axios.post('/upload', formData).then(res => {
                    this.images.unshift(res.data[0]); //Place new image at the beginning automatically (no need to refresh)
                });
            },
            //Include file//
            handleFileChange: function(e) {
                this.form.file = e.target.files[0]; //Now uploadFile's this has all the info of the form (file included)
            },
            displayImg: function(e) {
                this.currentImg = e;
            },
            closeImg: function(e) {
                this.currentImg = null;
            },
            showNextPics(e) {
                var self = this;
                var lastIndex = self.images.length -1;
                var lastOfChunk = self.images[lastIndex].id;
                axios.get('/next-images/' + lastOfChunk).then(res => {
                    self.images.push.apply(self.images, res.data);
                    if (lastOfChunk <= 6) {
                        self.morePics = false;
                    }
                });
            },

        }
    });
})();
