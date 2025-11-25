const ROUTES = {
  HOME: "/",
  COMMUNITY: "/community",
  TAGS: "/tags",
  TAG: (id: string) => `/tags/${id}`,
  COLLECTION: "/collection",
  JOBS: "/jobs",
  ASK_QUESTION: "/ask-question",
  QUESTION: (id: string) => `/questions/${id}`,
  PROFILE: (id: string) => `/profile/${id}`,
  SIGN_IN: "/signin",
  SIGN_UP: "/signup",
};

export default ROUTES;
