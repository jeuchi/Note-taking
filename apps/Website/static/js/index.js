// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        user_email: user_email,
        posts: [], // See initialization.
        editing: false,
    };
    
    app.index = (a) => {
        // Adds to the posts all the fields on which the UI relies.
        let i = 0;
        for (let p of a) {
            p._idx = i++;
            p.edit = false;
            p.original_content = p.content; // Content before an edit.
            p.server_content = p.content; // Content on the server.
            p.server_title = p.title;
            p.original_title = p.title;
            p.color = p.color;
            p.star = p.star;
        }
        return a;
    };

    app.reindex = () => {
        // Adds to the posts all the fields on which the UI relies.
        let i = 0;
        for (let p of app.vue.posts) {
            p._idx = i++;
        }
    };


    app.add_post = () => {
        // TODO: this is the new post we are inserting.
        // You need to initialize it properly, completing below, and ...
        let q = {
            color: "transparent",
            id: null,
            star: false,
            edit: true,
            content: "",
            title: "",
            server_content: null,
            original_content: "",
            original_title: "",
            server_title: null,
            email: app.vue.user_email,
        };
        console.log("ADD", q.email);
        app.vue.posts.unshift({
                    id: q.id,
                    star: q.star,
                    content: q.content,
                    color: q.color,
                    title: q.title,
                    original_title: q.original_title,
                    server_title: q.server_title,
                    edit: q.edit,
                    original_content: q.original_content,
                    server_content: q.server_content
                
        })
        app.reindex();
        
        // TODO:
        // ... you need to insert it at the top of the post list.
      
    };
    
    app.do_save = (post_idx) => {
        // Handler for "Save edit" button.
        let p = app.vue.posts[post_idx];
        if (p.content !== p.server_content || p.title !== p.server_title) {
            axios.post(posts_url, {
                content: p.content,
                title: p.title,
                id: p.id,
                color: p.color,
                star: p.star,
            }).then((result) => {
                console.log("Received:", result.data);
                // TODO: You are receiving the post id (in case it was inserted),
                // and the content.  You need to set both, and to say that
                // the editing has terminated.
                p.content = result.content;
                p.color = result.color;
                p.id = result.id;
                p.title = result.title;
                p.server_content = result.content;
                p.server_title = result.title;
                p.star = result.star;
                axios.get(posts_url).then((result) => {
                    p.edit = false;
                    app.vue.editing = false;
                    app.vue.posts = app.index(result.data.posts);
                })
            }).catch(() => {
                console.log("Caught error");
                // We stay in edit mode.
            });
        } else {
            // No need to save.
            p.edit = false;
            app.vue.editing = false;
            p.original_content = p.content;
            p.original_title = p.title;
        }
    }

    app.do_edit = (post_idx) => {
        let p = app.vue.posts[post_idx];
        if(app.vue.editing === true)
            return;
        p.edit = true;
        app.vue.editing = true;
    };

    app.do_color = (post_idx, post_color) => {
        let p = app.vue.posts[post_idx];
   
        if(app.vue.editing === true)
            return;
        
        if(p.color === post_color)
        {
            p.color = "transparent";
        }else{
            p.color = post_color;
        }
        
        axios.post(posts_url, {
                content: p.content,
                title: p.title,
                id: p.id,
                color: p.color,
                star: p.star,
            }).then((result) => {
                console.log("Changed Color:", result.data);
                // TODO: You are receiving the post id (in case it was inserted),
                // and the content.  You need to set both, and to say that
                // the editing has terminated.
                p.content = result.content;
                p.color = result.color;
                p.id = result.id;
                p.title = result.title;
                p.server_content = result.content;
                p.server_title = result.title;
                p.star = result.star
                axios.get(posts_url).then((result) => {
                    p.edit = false;
                    app.vue.editing = false;
                    app.vue.posts = app.index(result.data.posts);
                })
            }).catch(() => {
                console.log("Caught error");
                // We stay in edit mode.
            });
    };
    
    app.do_star = (post_idx) => {
        let p = app.vue.posts[post_idx];
        
        if(app.vue.editing === true)
            return;
        
        if(p.star === true)
        {
            p.star = false;
        }else{
            p.star = true;
        }
        
        axios.post(posts_url, {
                content: p.content,
                title: p.title,
                id: p.id,
                color: p.color,
                star: p.star,
            }).then((result) => {
                console.log("Changed Color:", result.data);
                // TODO: You are receiving the post id (in case it was inserted),
                // and the content.  You need to set both, and to say that
                // the editing has terminated.
                p.content = result.content;
                p.color = result.color;
                p.id = result.id;
                p.title = result.title;
                p.server_content = result.content;
                p.server_title = result.title;
                p.star = result.star
                axios.get(posts_url).then((result) => {
                    p.edit = false;
                    app.vue.editing = false;
                    app.vue.posts = app.index(result.data.posts);
                })
            }).catch(() => {
                console.log("Caught error");
                // We stay in edit mode.
            });
    };

     app.do_cancel = (post_idx) => {
        // Handler for button that cancels the edit.
        let p = app.vue.posts[post_idx];
        if (p.id === null) {
            // If the post has not been saved yet, we delete it.
            app.vue.posts.splice(post_idx, 1);
            app.reindex();
        } else {
            // We go back to before the edit.
            p.edit = false;
            app.vue.editing = false;
            p.content = p.original_content;
        }
    }


    app.do_delete = (post_idx) => {
        let p = app.vue.posts[post_idx];
        if (p.id === null) {
            // TODO:
            // If the post has never been added to the server,
            // simply deletes it from the list of posts.
            app.vue.posts.splice(post_idx, 1);
            app.reindex(app.vue.posts);
        } else {
            // TODO: Deletes it on the server.
            axios.post(delete_url, {id: p.id}).then(() => {
            // The deletion went through on the server. Deletes also locally.
            // Isn't it obvious that splice deletes an element?  Such is life.
            app.vue.posts.splice(post_idx, 1);
            app.reindex(app.vue.posts);
        })
        }
    };
    
    app.confirmDelete = (post_idx) => {
        if (confirm("Are you sure you want to delete?")) {
           app.do_delete(post_idx);
        } else {
            return;
        }
    };

    // We form the dictionary of all methods, so we can assign them
    // to the Vue app in a single blow.
    app.methods = {
        add_post: app.add_post,
        do_save: app.do_save,
        do_edit: app.do_edit,
        do_color: app.do_color,
        do_star: app.do_star,
        do_delete: app.do_delete,
        confirmDelete: app.confirmDelete,
        do_cancel: app.do_cancel,
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });

    // And this initializes it.
    app.init = () => {
        axios.get(posts_url).then((result) => {
             app.vue.posts = app.index(result.data.posts);
        })
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);
