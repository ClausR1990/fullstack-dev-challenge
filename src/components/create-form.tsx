import React from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";

const formSchema = z.object({
  departure: z.date({
    required_error: "Please provide departure date",
  }),
  arrival: z.date({
    required_error: "Please provide arrival date",
  }),
  PortOfLoading: z.union([z.literal("Copenhagen"), z.literal("Oslo")]),
  PortOfDischarge: z.union([z.literal("Copenhagen"), z.literal("Oslo")]),
  vessel: z.union([z.literal("Pearl Seaways"), z.literal("Crown Seaways")]),
});

type FormData = z.infer<typeof formSchema>;

const CreateVoyageForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: FormData) => {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}></form>
    </Form>
  );
};

export default CreateVoyageForm;
