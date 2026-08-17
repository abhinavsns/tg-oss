describe("warnings", function () {
  it(`should be able to visualize warnings on the circular and row views and click them`, () => {
    cy.visit("#/Editor?showCicularViewInternalLabels=false");
    cy.tgToggle("showWarningFeature");
    cy.get(".veLabelText").contains("J5 Warning").first().dblclick();
    cy.contains(".bp6-dialog", "I'm a fake warning!");
    cy.contains(".bp6-button", "OK").click();
    cy.get(".veLabelText").contains("J5 Warning").first().rightclick();
    cy.contains(".bp6-menu-item", "View Warning Details").click();
    cy.contains(".bp6-dialog", "I'm a fake warning!");
  });
});
