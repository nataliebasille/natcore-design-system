import { DocPage, DocSection } from "@/components/doc/DocPage";
import { DeprecatedExampleContainer } from "@/components/doc/DeprecatedExampleContainer";
import { generateThemeInfo } from "@/utlls/generate-theme-info";
import formControlTheme from "../../../../packages/core/src/themes/components/form-control";
import { ThemeClassesContainer } from "@/components/doc/ThemeClassesContainer";
import { fetchFile } from "@/components/fetch-file";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const formControlThemeInfo = generateThemeInfo(formControlTheme, {
  "form-control": "",
  "form-control-label": "",
  "form-control-hint": "",
  "form-control-error": "",
  "form-control-prefix": "",
  "form-control-suffix": "",
  "form-control-primary": "",
  "form-control-secondary": "",
  "form-control-surface": "",
});

export default async function FormControlPage() {
  return (
    <DocPage
      title="Form controls"
      description="Add additional components, such as title and helper text, to form fields"
    >
      <DocSection title="Classes">
        <ThemeClassesContainer theme={formControlThemeInfo} />
      </DocSection>
      <DocSection title="Usage">
        <DocSection
          title="Labelling"
          description={
            <>
              Use either the{" "}
              <code
                className="text-secondary-800 inline-block bg-transparent p-0 font-bold"
                style={{ padding: "0 !important" }}
              >
                `label`
              </code>{" "}
              element or the{" "}
              <code
                className="text-secondary-800 inline-block bg-transparent p-0 font-bold"
                style={{ padding: "0 !important" }}
              >
                `.form-control-label`
              </code>{" "}
              to add a persistent label to a field.
            </>
          }
        >
          <DeprecatedExampleContainer
            html={await fetchFile("forms/form-controls/examples/labelled.html")}
          />
        </DocSection>

        <DocSection
          title="Input hint"
          description={
            <>
              Use the{" "}
              <code
                className="text-secondary-800 inline-block bg-transparent p-0 font-bold"
                style={{ padding: "0 !important" }}
              >
                `.form-control-hint`
              </code>{" "}
              class to add additional information to the bottom a field.
            </>
          }
        >
          <DeprecatedExampleContainer
            html={await fetchFile("forms/form-controls/examples/hints.html")}
          />
        </DocSection>

        <DocSection
          title="Validation"
          description={
            <>
              Invalid field can be styled using the{" "}
              <code
                className="text-secondary-800 inline-block bg-transparent p-0 font-bold"
                style={{ padding: "0 !important" }}
              >
                `.form-control-error`
              </code>{" "}
              class. Use this in conjunction with the{" "}
              <code
                className="text-secondary-800 inline-block bg-transparent p-0 font-bold"
                style={{ padding: "0 !important" }}
              >
                `.form-control-hint`
              </code>{" "}
              class to indicate the reason for the invalid state.
            </>
          }
        >
          <DeprecatedExampleContainer
            html={await fetchFile(
              "forms/form-controls/examples/validation.html",
            )}
          />
        </DocSection>

        <DocSection
          title="Fixins"
          description={
            <>
              Prefix or suffix a field with additional content using the{" "}
              <code
                className="text-secondary-800 inline-block bg-transparent p-0 font-bold"
                style={{ padding: "0 !important" }}
              >
                `.form-control-prefix`
              </code>{" "}
              and
              <code
                className="text-secondary-800 inline-block bg-transparent p-0 font-bold"
                style={{ padding: "0 !important" }}
              >
                `.form-control-suffix`
              </code>
              classes.
            </>
          }
        >
          <DeprecatedExampleContainer
            html={await fetchFile("forms/form-controls/examples/fixins.html")}
          />
        </DocSection>
      </DocSection>
    </DocPage>
  );
}
