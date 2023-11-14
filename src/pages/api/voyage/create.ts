import type { NextApiHandler, NextApiResponse, NextApiRequest } from "next";
import { prisma } from "~/server/db";
import * as z from "zod";

const payload = z.object({
  portOfLoading: z.string(),
  portOfDischarge: z.string(),
  vesselId: z.string(),
  scheduledDeparture: z.string(),
  scheduledArrival: z.string(),
  unitTypes: z.array(z.string()),
});

export type VoyageCreatePayload = z.infer<typeof payload>;

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    if (req.method !== "PUT") {
      res.status(405).json({ error: "failed to load data" });
    }
    const body = JSON.parse(req.body) as VoyageCreatePayload;

    console.log("💯", body);

    const parsedBody = await payload.parseAsync(body);

    const { unitTypes, ...restData } = parsedBody;

    const createVoyage = await prisma.voyage.create({
      data: {
        ...restData,
        unitTypes: {
          connect: unitTypes.map((unitType) => ({ id: unitType })),
        },
      },
    });

    if (!createVoyage) {
      throw new Error("Error while created database entry");
    }
    res.status(201).json({ message: "Voyage created" });
  } catch (error) {
    let err = error;
    if (err instanceof z.ZodError) {
      console.log("😣", err);
      err = err.issues.map((e) => ({ path: e.path[0], message: e.message }));
    }

    res.status(500).json(err);
  }
};

export default handler;
