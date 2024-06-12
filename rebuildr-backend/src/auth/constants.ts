export const jwtConstants = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.NODE_ENV === 'development' ? '300s' : '3600s',
};
