import type { Vessel, Voyage } from "@prisma/client";
import type { NextApiHandler, NextApiResponse, NextApiRequest } from "next";
import { prisma } from "~/server/db";

export type ReturnType = (Voyage & { vessel: Vessel })[];

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method === "DELETE") {
    // randomly fail the delete request
    const maybe = Math.round(Math.random());
    if (maybe) {
      res.status(400).end();
      return;
    }
    const deletedVoyage = await prisma.voyage.delete({
      where: {
        id: req.query.id as string,
      },
    });

    deletedVoyage ? res.status(204) : res.status(404);
    res.end();
    return;
  }

  res.status(405).end();
};

export default handler;
