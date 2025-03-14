module.exports = {
	apps: [
		{
		name: 'game-login-server2',
		script: 'npm',
		args: 'run start',
		env: {
			GOOGLE_CLIENT_ID:'360702445512-oclkjdkkq1c12ib3ut0qn9gjhmnbe1j.apps.googleusercontent.com',
			GOOGLE_CLIENT_SECRET:'GOCSPX-paTh-Edz2XxZ2_Ju30MZuKdX8E',
			GOOGLE_CALLBACK_URL:'https://leeyoungwoo.shop/auth/google/callback'
			},
		},
		],
};
