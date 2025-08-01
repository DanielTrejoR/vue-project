const getters = {
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  // visitedViews: state => state.tagsView.visitedViews,
  // cachedViews: state => state.tagsView.cachedViews,
  token: state => state.admin.token,
  avatar: state => state.admin.avatar,
  name: state => state.admin.name,
  introduction: state => state.admin.introduction,
  roles: state => state.auth.roles,
  permissions: state => state.admin.permissions,
  permission_routes: state => state.permission.routes,
  // errorLogs: state => state.errorLog.logs,
  isAuthenticated: state => state.admin.authenticated,
  user: state => state.auth.user,
}
export default getters