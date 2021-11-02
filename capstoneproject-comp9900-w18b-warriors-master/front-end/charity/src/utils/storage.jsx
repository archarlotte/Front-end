import store from 'store'
const TOKEN = 'Email';
const Role = "Role";

export default {
	saveToken (token) {
		store.set(TOKEN, token);
	},
	getToken () {
		return store.get(TOKEN) || {}
	},
	removeToken () {
		store.remove(TOKEN);
	},
	saveRole (role) {
		store.set(Role, role);
	},
	getRole () {
		return store.get(Role) || {}
	},
	removeRole () {
		store.remove(Role);
	}
}
