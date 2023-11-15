import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Button } from "./ui/button";
import CreateVoyageForm from "./create-form";

const CreateVoyageButton = () => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="default">Create</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create a new Voyage</SheetTitle>
          <SheetDescription>
            This action will create a new voyage. Fill out the form below and
            submit by clicking create.
          </SheetDescription>
        </SheetHeader>
        <CreateVoyageForm setOpen={setOpen} />
      </SheetContent>
    </Sheet>
  );
};

export default CreateVoyageButton;
