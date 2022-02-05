import { Request, Response } from "express";
import { AuthenticateUserService } from "../services/AuthenticateUserService";

class AuthenticateUserController {
  async handle(request: Request, response: Response) {

    const { code } = request.body;

    const service = new AuthenticateUserService();
    try {

      // Execução do método de "execute"
      const result = await service.execute(code);

      // Retorna o objeto json
      return response.json(result);

    } catch (error) {
      return response.json({ error: error.message })
    }
  }
}


export { AuthenticateUserController } 