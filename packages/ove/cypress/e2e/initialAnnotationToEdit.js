describe("initialAnnotationToEdit", function () {
  it(`should be able to pass an initialAnnotationToEdit`, () => {
    cy.visit("#/Editor?initialAnnotationToEdit=true");
    cy.contains(".bp6-dialog", "Edit Part");
    cy.contains(".bp6-dialog", "status: ready");
  });
});
