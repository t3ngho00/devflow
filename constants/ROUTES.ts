const ROUTES = {
    HOME: '/',
    SIGN_IN: '/signin',
    SIGN_UP: '/signup',
    ASK_QUESTION: '/ask-question',
    QUESTION: (id: string) => `/questions/${id}`,
    TAGS: (id: string) => `/tags/${id}`,
    PROFILE: (id: string) => `/profile/${id}`,
}

export default ROUTES;