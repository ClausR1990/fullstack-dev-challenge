import type { Vessel, Voyage, UnitType } from "@prisma/client";
import type { NextApiHandler, NextApiResponse } from "next";
import { prisma } from "~/server/db";

export type ReturnType = (Voyage & { vessel: Vessel; unitTypes: UnitType[] })[];

const handler: NextApiHandler = async (_, res: NextApiResponse<ReturnType>) => {
  const voyages = await prisma.voyage.findMany({
    include: {
      vessel: {},
      unitTypes: {},
    },
  });

  res.status(200).json(voyages);
};

export default handler;
