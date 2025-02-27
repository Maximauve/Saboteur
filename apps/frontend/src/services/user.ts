import { type UserWithoutPassword as User } from "@saboteur/api/src/domain/model/user";

import { baseApi } from "@/services/base";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    refreshUser: builder.query<User, void>({
      query: () => "/users/me",
      providesTags: ['User']
    }),
  }),
});

export const { useRefreshUserQuery } = userApi;
