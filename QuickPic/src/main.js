import API from './api.js';
// // A helper you may want to use when uploading new images to the server.
import { fileToDataUrl, toDate } from './helpers.js';

const api = 'http://localhost:5000';
const form = document.forms[0];
const homePage = document.getElementById('homePage');
const divLogin = document.getElementById('divLogin');
const personpage = document.getElementById('personpage');
const profile = document.getElementById('profile')
const profilepage = document.getElementById('profilepage');
const profilebox = document.getElementById('profilebox');


let p = 0;
let n = 10;

const logoutBtn = document.getElementById('logoutbtn');
logoutBtn.addEventListener('click', ()=> {
	localStorage.clear();
	divLogin.style.display = 'block';
	homePage.style.display = 'none';
})

const showFeed = () => {
	divLogin.style.display = 'none';
	homePage.style.display = 'block';
	getFeed(p,n);
}

let usertoken = undefined;
let profilename = undefined;

form.addEventListener('submit', (event) => {
	console.log('1');
	const username = form.username.value;
	const password = form.pw.value;
	const conpw = form.conpw.value;
	event.preventDefault();
	if (password !== conpw) {
		alert('password are not match');
	} else {
		const result = fetch(`${api}/auth/login`,{
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
					"username":`${username}`,
					"password":`${password}`
			}
			)
		}).then((response) => {
			if (response.status === 403) {
				alert('incorrect login detail');
			}else if (response.status === 200){
				response.json().then((response) => {
					usertoken = response.token;
					localStorage.setItem("token", usertoken);
					// document.cookie =  'token=' + usertoken + '';
					divLogin.style.display = 'none';
					homePage.style.display = 'block';
					getFeed(p,n);
					profilename = username;
					localStorage.setItem('username', profilename);
					profile.innerText= profilename;
				})
			}
		})
			.catch(error => console.error('Error:', error))
	}
})

const rbtn = document.getElementById('rbtn');

rbtn.addEventListener('click', () =>{
	const divLogin = document.getElementById('divLogin');
	divLogin.style.display = 'none';
	const divReg = document.getElementById('divReg');
	divReg.style.display = 'block';
	}
)

const regForm = document.forms["regForm"];

regForm.addEventListener('submit', (event) => {
	console.log('2');
	event.preventDefault();
	const username = regForm.username.value;
	const password = regForm.pw.value;
	const conpw = regForm.conpw.value;
	const email = regForm.email.value;
	const name = regForm.aname.value;

	if (password !== conpw) {
		alert('password are not match');
	} else {
		const result = fetch(`${api}/auth/signup`,{
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
					"username":`${username}`,
					"password":`${password}`,
				"email":`${email}`,
				"name":`${name}`
				}
			)
		}).then((response) => {
			console.log(response.status);
			if (response.status === 403) {
				alert('incorrect login detail');
			}else if (response.status === 200){
				response.json().then((response) => {
					usertoken = response.token;
					localStorage.setItem("token", usertoken);
					console.log(response);
					profilename = username;
					localStorage.setItem('username', profilename);
					profile.innerText= profilename;
				})
			}
		})
			.catch(error => console.error('Error:', error))
	}
})





window.addEventListener('scroll', ()=> {
	const {scrollHeight, scrollTop, clientHeight} = document.documentElement;
	if (scrollTop + clientHeight > scrollHeight - 5) {
		p += 10;
		n += 10;
		console.log('scroll')
		console.log(p,n)
		setTimeout(getFeed(p,n), 2000);
	}
})
console.log(p,n)

const getFeed = (p,n) => {
	console.log(p,n)
	const feed = fetch(`${api}/user/feed?p=` + p + `&n=${n}`, {
		method:'GET',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'Authorization': 'Token ' + usertoken
		}
	}).then((response) => {
		if (response.status === 200){
			response.json().then(feed => {
				const post = feed['posts'];
				post.map(post => {
					const postBox = document.getElementById('postBox');
					const box = document.createElement('div');
					box.className = 'box';

					const authElement = document.createElement('div');
					authElement.innerText = post.meta.author;
					authElement.addEventListener('click', () => {
						const person = fetch(`${api}/user?username=`+authElement.innerText, {
							method: 'GET',
							headers: {
								'Accept': 'application/json',
								'Content-Type': 'application/json',
								'Authorization': 'Token ' + usertoken,
							},
						}).then(response => {
							if (response.status === 200){
								response.json().then(person => {
									console.log(person);
									homePage.style.display = 'none';
									personpage.style.display = 'block';
									const personbox = document.getElementById('personbox');

									const personname = document.createElement('div');
									personname.innerText = person.username;
									personbox.appendChild(personname);


									person.posts.map(postid => {
										const allPost = fetch(`${api}/post?id=`+ postid, {
											method: 'GET',
											headers: {
												'Accept': 'application/json',
												'Content-Type': 'application/json',
												'Authorization': 'Token ' + usertoken,
											},
										}).then(response => {
											if (response.status === 200) {
												response.json().then(allPost => {

													const singlePost = document.createElement('div');

													const singleTime = document.createElement('div');
													singleTime.innerText = toDate(allPost.meta.published);
													singlePost.appendChild(singleTime);

													const thumbPic = document.createElement('img');
													thumbPic.setAttribute('src', `data:image/jpeg;base64,${allPost['thumbnail']}`);
													singlePost.appendChild(thumbPic);

													const sigleLike = document.createElement('div');
													sigleLike.innerText = allPost.meta.likes.length;
													singlePost.appendChild(sigleLike);

													personbox.appendChild(singlePost);



												})
											}
										})
									})

								})
							}
						})
						console.log(authElement.innerText);
					})
					box.appendChild(authElement);

					const timeElement = document.createElement('div');
					const dateStr = toDate(post.meta.published);
					timeElement.innerText = dateStr;
					box.appendChild(timeElement);

					const imageElement = document.createElement('img');
					imageElement.setAttribute('src', `data:image/jpeg;base64,${post['thumbnail']}`);
					box.appendChild(imageElement);

					const likeElement = document.createElement('div');
					likeElement.innerText = post.meta.likes.length;
					post.meta.likes.map(like => {
						const likeName = fetch(`${api}/user?id=` + `${like}`, {
							method: 'GET',
							headers: {
								'Accept': 'application/json',
								'Content-Type': 'application/json',
								'Authorization': 'Token ' + usertoken,
							},
						}).then(response => {
								if (response.status === 200) {
									response.json().then(likeName => {
										likeElement.innerText += ` ${likeName.username}`;
									})
								}else {
									alert('something wrong');
								}
						})
					})
					box.appendChild(likeElement);

					const desElement = document.createElement('div');
					desElement.innerText = post.meta.description_text;
					box.appendChild(desElement);

					const comElement = document.createElement('div');
					comElement.innerText = post.comments.length;
					post.comments.map(comment => {
						console.log(comment.comment);
						comElement.innerText += ` ${comment.comment}`
					});
					// comElement.innerText += ` ${post.comments.comment}`;
					box.appendChild(comElement);

					const likeBtn = document.createElement('button');
					likeBtn.innerText = 'like';
					likeBtn.addEventListener('click', () => {
						const likeFetch = fetch(`${api}/post/like?id=`+ `${post.id}`, {
							method: 'PUT',
							headers: {
								'Accept': 'application/json',
								'Content-Type': 'application/json',
								'Authorization': 'Token ' + usertoken,
							},
						}).then(response => {
							if (response.status === 200) {
								alert('success')
							}else {
								alert('somthing wrong');
							}
						})
					})
					box.appendChild(likeBtn);

					const commentBtn = document.createElement('button');
					commentBtn.innerText = "comment";
					box.appendChild(commentBtn);

					commentBtn.addEventListener('click', () => {
						const commentBox = document.createElement('input');
						commentBox.type = "text";
						box.appendChild(commentBox);

						const submitComment = document.createElement('button');
						submitComment.innerText = "submit";
						box.appendChild(submitComment);

						submitComment.addEventListener('click', () => {
							const commentContent = commentBox.value;
							const commentData = fetch(`${api}/post/comment?id=` + post.id, {
								method: 'PUT',
								headers: {
									'Accept': 'application/json',
									'Content-Type': 'application/json',
									'Authorization': 'Token ' + usertoken,
								},
								body: JSON.stringify({
									"comment":commentContent
								})
							}).then(response => {
								if (response.status === 200) {
									alert('success')
								}else {
									alert('somthing wrong');
								}
							})
							})
						})

					postBox.appendChild(box);
				})
			})
		}
	}).catch(error => console.error('Error:', error))
}

if (localStorage.getItem('token')) {
	usertoken = localStorage.getItem('token');
	profilename = localStorage.getItem('username');
	profile.innerText= profilename;
	showFeed();
	// profile.addEventListener('click', () => {
	// 	const
	// })
}

profile.addEventListener('click', () => {
	profilepage.style.display = 'block';
	homePage.style.display = 'none';

	const personPage = fetch(`${api}/user?username=`+ profilename, {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'Authorization': 'Token ' + usertoken,
		},
	}).then(response => {
		if (response.status === 200) {
			response.json().then(personPage => {
				const singlePost = document.createElement('div');


				const singlename = document.createElement('div');
				singlename.innerText = profilename;
				singlePost.appendChild(singlename);
				console.log(personPage.posts);
				personPage.posts.map( perpost => {

					const personPost = fetch(`${api}/post?id=` + perpost, {
						method: 'GET',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json',
							'Authorization': 'Token ' + usertoken,
						},
					}).then(response => {
						if (response.status === 200){
							response.json().then(personPost => {
								const personbox = document.createElement('div');

								const personTime = document.createElement('div');
								personTime.innerText = toDate(personPost.meta.published);
								personbox.appendChild(personTime);

								const thumbPic = document.createElement('img');
								thumbPic.setAttribute('src', `data:image/jpeg;base64,${personPost['thumbnail']}`);
								personbox.appendChild(thumbPic);

								const personLike = document.createElement('div');
								personLike.innerText = personPost.meta.likes.length;
								personbox.appendChild(personLike);

								const deletbox = document.createElement('button');
								deletbox.innerText = "delete";
								personbox.appendChild(deletbox);

								deletbox.addEventListener('click', () => {
									console.log(perpost)
									const deletPost = fetch(`${api}/post?id=` + perpost, {
										method: 'DELETE',
										headers: {
											'Accept': 'application/json',
											'Content-Type': 'application/json',
											'Authorization': 'Token ' + usertoken,
										},
									}).then(response => {
										if (response.status === 200) {
											console.log('success');
										}
									})
								})

								const updatebox = document.createElement('button');
								updatebox.innerText = "update";
								personbox.appendChild(updatebox);

								updatebox.addEventListener('click', () => {
									console.log(perpost)
									updatePage.style.display = 'block';
									profilepage.style.display = 'none';
									const updateId = document.createElement('div');
									updateId.innerText = perpost;
									updatePage.appendChild(updateId);
								})
								singlePost.appendChild(personbox);
							})
						}
					})

				})
				profilebox.appendChild(singlePost);
			})
		}
	})
})


const otherFollow = document.getElementById('otherFollow');
otherFollow.addEventListener('click', () => {
	const theUser = otherFollow.nextElementSibling.firstChild.innerText;
	if (otherFollow.innerText === 'follow') {
		const getFollow = fetch(`${api}/user/follow?username=` + theUser, {
			method: 'PUT',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': 'Token ' + usertoken,
			},
		}).then(response => {
			if (response.status === 200) {
				alert('success');
			}
		})
		otherFollow.innerText = 'unfollow';
	}else {
		const getFollow = fetch(`${api}/user/unfollow?username=` + theUser, {
			method: 'PUT',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': 'Token ' + usertoken,
			},
		}).then(response => {
			if (response.status === 200) {
				alert('unfollow success');
			}
		})
		otherFollow.innerText = 'follow';
	}
})

const addPost = document.getElementById('addPost');
const postPage = document.getElementById('postPage');
addPost.addEventListener('click', () => {
	postPage.style.display = 'block';
	homePage.style.display = 'none';
})


const postsubmit = document.getElementById('postsubmit')

postsubmit.addEventListener('click', () => {
	const description = document.getElementById('description').value;
	const file = document.getElementById('picture').files[0];
	fileToDataUrl(file).then(data => {
		const srcdata = data.split(',')[1];
		const postFetch = fetch(`${api}/post`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': 'Token ' + usertoken,
			},
			body: JSON.stringify({
					"description_text": description,
					"src": srcdata
				}
			)
		}).then(response => {
			if (response.status === 200) {
				response.json().then(postFetch => {
					console.log('success');
				})
			}
		})
	});
})


const upSubmit = document.getElementById('upsubmit');
upSubmit.addEventListener('click', () => {
	const description = document.getElementById('updescription').value;
	const file = document.getElementById('uppicture').files[0];
	const updateId = upSubmit.nextElementSibling.innerText;
	console.log(updateId);
	fileToDataUrl(file).then(data => {
		const srcdata = data.split(',')[1];
		const updatePost = fetch(`${api}/post?id=` + updateId, {
			method: 'PUT',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': 'Token ' + usertoken,
			},
			body: JSON.stringify({
					"description_text": description,
					"src": srcdata
				}
			)
		}).then(response => {
			if (response.status === 200) {
				response.json().then(postFetch => {
					console.log('success');
				})
			}
		})
	});
})


const editBtn = document.getElementById('edit');
const updateProfile = document.getElementById('updateProfile');
editBtn.addEventListener('click', () => {
	profilepage.style.display = 'none';
	updateProfile.style.display = 'block';
})

const upProfileBtn = document.getElementById('profileSubmit');
upProfileBtn.addEventListener('click', () => {
	const upEmail = document.getElementById('upEmail').value;
	const upName = document.getElementById('upName').value;
	const upPassword = document.getElementById('upPassword').value;
	console.log(upEmail);
	console.log(upName);
	console.log(upPassword);
	const updateFetch = fetch(`${api}/user`, {
		method: 'PUT',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'Authorization': 'Token ' + usertoken,
		},
		body: JSON.stringify({
			"email": upEmail,
			"name": upName,
			"password": upPassword
			}
		)
	}).then(response => {
		if (response.status === 200) {
			alert('success')
		}
	})
})


