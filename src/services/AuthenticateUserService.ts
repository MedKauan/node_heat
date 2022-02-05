import axios from "axios";
import prismaClient from "../prisma/index"
import { sign } from "jsonwebtoken"

/**
 * Receber Code(string)
 * Recuperar o access_token no github
 * Recupar info do user no github
 * Verificar se o usuario existe no DB
 * ----- SIM = Gera um token
 * ----- Não = Cria no DB, e gera um token
 * 
 * Retornar o token com as infos do usuario
 */

interface IAccessTokenResponse{
  access_token: string;
}

interface IUserResponse{
  avatar_url: string,
  login: string,
  id: number,
  name: string
}

class AuthenticateUserService {
  async execute(code: string) {
    const url = "https://github.com/login/oauth/access_token";

    // Envio a requisição para autenticar
    const { data: accessTokenResponse } = await axios.post<IAccessTokenResponse>(url, null, {
      params: {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      headers: {
        Accept: "application/json"
      }
    })

    // Quando eu tiver a resposta da requisição
    const response = await axios.get<IUserResponse>("https://api.github.com/user", {
      headers: {
        authorization: `Bearer ${ accessTokenResponse.access_token }`
      }
    });

    // "Tipo" o response para pegar apenas os dados que eu quero
    const { login, id, avatar_url, name } = response.data;

    // Procuro no banco de dados o primeiro que tiver o id igual ao que foi retornado da requisição 
    let user = await prismaClient.user.findFirst({
      where:{
        github_id: id
      }
    })

    // Se não tiver cadastrado, eu crio no banco
    if (!user) {
      user = await prismaClient.user.create({
        data: {
          github_id: id,
          login: login,
          avatar_url: avatar_url,
          name: name
        }
      })
    }

    // Geração do Token
    const token = sign(
      {
        user: {
          name: user.name,
          avatar_url: user.avatar_url,
          id: user.id
        }  
      },
      process.env.JWT_SECRET,
      {
        subject: user.id,
        expiresIn: "1d"
      }
    )

    // Retorno as informações do token e o usuário 
    return { token, user };
  }
}

export { AuthenticateUserService }