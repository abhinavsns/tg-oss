describe("versionHistory", function () {
  beforeEach(() => {
    cy.visit("");
  });
  it("should be accessible from the demo", function () {
    cy.get(".tg-menu-bar").contains("File").click();
    cy.get(".bp6-menu-item").contains("Revision History").click();
    cy.contains("Past Versions");
    cy.contains(".bp6-button", "Revert to Selected").should(
      "have.class",
      "bp6-disabled"
    );
    cy.contains("Nara").click();
    cy.contains(".bp6-button", "Revert to Selected")
      .should("not.have.class", "bp6-disabled")
      .click();
    cy.contains(".bp6-toast", "onSave callback triggered");
    cy.contains(".bp6-button", "Revert to Selected").should("not.exist");
  });
});
