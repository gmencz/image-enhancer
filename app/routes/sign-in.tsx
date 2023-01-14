import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { z } from "zod";
import { Footer } from "~/components/Footer";
import { Nav } from "~/components/Nav";
import { SignInForm } from "~/components/SignIn/Form";
import { sendSignInEmail } from "~/lib/mail.server";
import { prisma } from "~/lib/prisma.server";
import { isOverLimit } from "~/lib/rate-limiting.server";
import { actionWithFormResponse } from "~/lib/responses.server";
import { getUserId } from "~/lib/session.server";

const schema = z.object({
  email: z
    .string()
    .min(1, { message: "Please enter your email address." })
    .email("Please enter a valid email address."),
});

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) {
    return redirect("/app/");
  }

  return null;
}

export async function action({ request }: ActionArgs) {
  const body = await request.formData();
  const fieldValues = { email: body.get("email") };
  const validation = await schema.safeParseAsync({ email: fieldValues.email });

  if (!validation.success) {
    return actionWithFormResponse({
      fieldValues,
      fieldErrors: validation.error.formErrors.fieldErrors,
      statusCode: 400,
    });
  }

  // 5 requests within 5 minutes max.
  const overLimit = await isOverLimit(request, {
    max: 5,
    windowInSeconds: 5 * 60,
  });

  if (overLimit) {
    return actionWithFormResponse({
      fieldValues,
      formError: "Slow down, you're making too many requests!",
      statusCode: 429,
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      email: validation.data.email,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    return actionWithFormResponse({
      fieldValues,
      formError: `The email you entered isn't registered.`,
      statusCode: 400,
    });
  }

  try {
    await sendSignInEmail(user.id, validation.data.email);
  } catch (error) {
    console.error(error);
    return actionWithFormResponse({
      fieldValues,
      formError: `Something went wrong sending you the sign in link.`,
      statusCode: 400,
    });
  }

  return actionWithFormResponse({
    fieldValues,
  });
}

export default function SignIn() {
  return (
    <div className="h-full flex flex-col">
      <Nav isSignedIn={false} />
      <main>
        <SignInForm />
      </main>
      <Footer />
    </div>
  );
}
