import type { Vessel, Voyage, UnitType } from "@prisma/client";
import type { NextApiHandler, NextApiResponse } from "next";
import { prisma } from "~/server/db";

export type ReturnType = (Voyage & { vessel: Vessel; unittype: UnitType })[];

const handler: NextApiHandler = async (_, res: NextApiResponse<ReturnType>) => {
  const voyages = await prisma.voyage.findMany({
    include: {
      vessel: {},
      unittype: {},
    },
  });

  res.status(200).json(voyages);
};

export default handler;
