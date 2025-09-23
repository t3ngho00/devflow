const ROUTES = {
    HOME: '/',
    SIGN_IN: '/signin',
    SIGN_UP: '/signup',
    QUESTION: (id: string) => `/question/${id}`,
    TAGS: (id: string) => `/tags/${id}`,
    ASK_QUESTION: '/ask-question'
}

export default ROUTES;