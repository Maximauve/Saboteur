import { type LoginResponse } from "@saboteur/api/src/domain/adapters/loginResponse";
import { type LoginDto, type RegisterDto } from "@saboteur/api/src/infrastructure/controllers/auth/auth-dto";

import { baseApi } from "@/services/base";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginDto>({
      query: (body: LoginDto) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ['User']
    }),
    register: builder.mutation<LoginResponse, RegisterDto>({
      query: (body: RegisterDto) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ['User']
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ['User']
    })
  }),
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation } = authApi;
