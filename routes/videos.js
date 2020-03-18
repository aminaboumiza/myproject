var express = require('express')
var multer = require('multer')
//var upload = multer({ dest: './public/upload/'});
//const ThumbnailGenerator = require('video-thumbnail-generator').default;
var path = require('path')
var http = require('http')
var bodeParser = require('body-parser')
routes = express.Router()
var app = express()

var ffmpeg = require('fluent-ffmpeg');
var ffmpegPath = './node_modules/ffmpeg-binaries/bin/ffmpeg.exe';

app.get('/', function(req, res, next) {
	req.getConnection(function(error, conn) {
		conn.query('SELECT * FROM videos ORDER BY id DESC',function(err, rows, fields) {
			//if(err) throw err
			if (err) {
				req.flash('error', err)
				res.render('video/list', {
					title: 'video List', 
					data: ''
				})
			} else {
				// render to views/video/list.ejs template file
				res.render('video/list', {
					title: 'video List', 
					data: rows
				})
			}
		})
	})
})

// const tg = new ThumbnailGenerator({
// 	sourcePath: '/uploads/video.mp4',
// 	thumbnailPath: '/uploads/'
	
// });
// tg.generateOneByPercent(50)
//   .then(console.log);

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads')
	  },
	filename : function(req, file, cb) {
	  cb(null, file.fieldname + '-' +Date.now() + path.extname(file.originalname) );
	}
  });
  
  
  
  const upload = multer({
	storage: storage
  })
  

// SHOW ADD Video FORM
app.get('/add', function(req, res, next){	
	// render to views/video/add.ejs
	console.log("ddddddd");
	res.render('video/add', {
		title: 'Add New Video',
		description: ''

	})
})

// ADD NEW Video POST ACTION
app.post('/add', upload.single('MyVideo'), (req,res, next)=>{	
	const file = req.file
	req.assert('description', 'description is required').notEmpty()
	
	var errors = req.validationErrors()
    
    if( !errors ) {   //No errors were found.  Passed Validation!
		console.log(file)
	
		
		// generate thumbnail
		file_name = file.filename;
		file_name = file_name.split('.').slice(0, -1).join('.');
		thumb_name = file_name+".png";

		
		var proc = new ffmpeg('./uploads/'+file.filename);
		proc.setFfmpegPath(ffmpegPath);
		proc.takeScreenshots({
			count: 1,
			filename: thumb_name,
			size: '320x240',
			timemarks: [ '5' ] // number of seconds
			}, './uploads/thumbnail', function(err) {
			console.log('screenshots were saved')
		});

		var video = {
			video_name: file.filename,
			description: req.sanitize('description').escape().trim(),
			video_type: file.mimetype,
			size : file.size,
			thumb_name:thumb_name
			
		}
		
		req.getConnection(function(error, conn) {
			conn.query('INSERT INTO videos SET ?', video, function(err, result) {
				//if(err) throw err
				if (err) {
					req.flash('error', err)
					
					// render to views/video/add.ejs
					res.render('video/add', {
						title: 'Add New Video',
						//video_name: video.video_name,
						description: video.description,
								
					})
				} else {				
					req.flash('success', 'Data added successfully!')
					console.log(file.filename)
					// render to views/video/add.ejs
					res.render('video/add', {
						title: 'Add New Video',
						description: '',
		
					})
				}
			})
		})
	}
	else {   //Display errors to video
		var error_msg = ''
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>'
		})				
		req.flash('error', error_msg)		
		
		/**
		 * Using req.body.name 
		 * because req.param('name') is deprecated
		 */ 
        res.render('video/add', { 
            title: 'Add New video',
			description: req.body.description,

        })
    }
})
// 	if (!file){
// 		console.log('error');
// 	}
// 	//console.log(req.file);
// 	res.send(file)
// })




// SHOW  video 
app.get('/show/(:id)', function(req, res, next){
	req.getConnection(function(error, conn) {
		conn.query('SELECT * FROM videos WHERE id = ?', [req.params.id], function(err, rows, fields) {
			if(err) throw err
			
			// if video not found
			if (rows.length <= 0) {
				req.flash('error', 'video not found with id = ' + req.params.id)
				res.redirect('/videos')
			}
			else { // if video found
				// render to views/video/show.ejs template file
				res.render('video/show', {
					title: '', 
					//data: rows[0],
					id: rows[0].id,
					video_name: rows[0].video_name,
					pause_time: rows[0].pause_time,
					description:rows[0].description,
					video_type:rows[0].video_type,
					size:rows[0].size
				})
			}			
		})
	})
})



// SHOW EDIT video FORM
app.get('/edit/(:id)', function(req, res, next){
	req.getConnection(function(error, conn) {
		conn.query('SELECT * FROM videos WHERE id = ?', [req.params.id], function(err, rows, fields) {
			if(err) throw err
			
			// if video not found
			if (rows.length <= 0) {
				req.flash('error', 'video not found with id = ' + req.params.id)
				res.redirect('/videos')
			}
			else { // if video found
				// render to views/video/edit.ejs template file
				res.render('video/edit', {
					title: '', 
					//data: rows[0],
					id: rows[0].id,
					video_name: rows[0].video_name,
					pause_time: rows[0].pause_time,
					description:rows[0].description,
					video_type:rows[0].video_type,
					size:rows[0].size
				})
			}			
		})
	})
})

// EDIT video POST ACTION
app.put('/edit/(:id)', function(req, res, next) {
	req.assert('video_name', 'Name is required').notEmpty()           //Validate name
	req.assert('pause_time', 'time is required').notEmpty()
	req.assert('description', 'description is required').notEmpty()             // 
	req.assert('video_type', 'video type is required').notEmpty()             // 
	req.assert('size', 'size is required').notEmpty()             // 

    var errors = req.validationErrors()
    
    if( !errors ) {   //No errors were found.  Passed Validation!
		
		var video = {
			video_name: req.sanitize('video_name').escape().trim(),
			pause_time: req.sanitize('pause_time').escape().trim(),
			description: req.sanitize('description').escape().trim(),
			video_type: req.sanitize('video_type').escape().trim(),
			size: req.sanitize('size').escape().trim(),

		}
		
		req.getConnection(function(error, conn) {
			conn.query('UPDATE videos SET ? WHERE id = ' + req.params.id, video, function(err, result) {
				//if(err) throw err
				if (err) {
					req.flash('error', err)
					
					// render to views/video/add.ejs
					res.render('video/edit', {
						title: 'Edit video',
						id: req.params.id,
						video_name: req.body.video_name,
						pause_time: req.body.pause_time,
						description: req.body.description,
						video_type: req.body.video_type,
						size: req.body.size,
						
					})
				} else {
					req.flash('success', 'Data updated successfully!')
					
					// render to views/video/add.ejs
					res.render('video/edit', {
						title: 'Edit video',
						id: req.params.id,
						video_name: req.body.video_name,
						pause_time: req.body.pause_time,
						description: req.body.description,
						video_type: req.body.video_type,
						size: req.body.size,
						
					
					})
				}
			})
		})
	}
    else {   //Display errors to video
        
		var error_msg = ''
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>'
		})
		req.flash('error', error_msg)
		
		/**
		 * Using req.body.name 
		 * because req.param('name') is deprecated
		 */ 
        res.render('video/edit', { 
            title: 'Edit video',            
			id: req.params.id, 
			video_name: req.body.video_name,
			pause_time: req.body.pause_time,
			description: req.body.description,
			video_type: req.body.video_type,
			size: req.body.size,
			
        })
    }
})
/*
app.get('/video', (req,res) =>{
    const path = 'public/assets/video.mp4';
   
    fs.stat(path, (err, stat) => {

       // Handle file not found
       if (err !== null && err.code === 'ENOENT') {
           res.sendStatus(404);
       }
   
       const fileSize = stat.size
       const range = req.headers.range
   
       if (range) {
   
           const parts = range.replace(/bytes=/, "").split("-");
   
           const start = parseInt(parts[0], 10);
           const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
           
           const chunksize = (end-start)+1;
           const file = fs.createReadStream(path, {start, end});
           const head = {
               'Content-Range': `bytes ${start}-${end}/${fileSize}`,
               'Accept-Ranges': 'bytes',
               'Content-Length': chunksize,
               'Content-Type': 'video/mp4',
           }
         


           res.writeHead(206, head);
           file.pipe(res);
       } else {
           const head = {
               'Content-Length': fileSize,
               'Content-Type': 'video/mp4',
           }
   
           res.writeHead(200, head);

           fs.createReadStream(path).pipe(res);
       }
   });
  // myValue = localStorage.getItem('time');
  // console.log(localStorage.getItem('time'));
 });
 */
//DELETE video
app.delete('/delete/(:id)', function(req, res, next) {
	var video = { id: req.params.id }
	
	req.getConnection(function(error, conn) {
		conn.query('DELETE FROM videos WHERE id = ' + req.params.id, video, function(err, result) {
			//if(err) throw err
			if (err) {
				req.flash('error', err)
				// redirect to videos list page
				res.redirect('/videos')
			} else {
				req.flash('success', 'video deleted successfully! id = ' + req.params.id)
				// redirect to videos list page
				res.redirect('/videos')
			}
		})
	})
})

module.exports = app
