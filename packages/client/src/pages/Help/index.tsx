import React from "react";
import PagesImage from "../../img/help/pages.png";
import "./Help.scss";

interface IHelpCardProps {
  title: string;
  children: React.ReactNode;
}

const HelpCard: React.FC<IHelpCardProps> = ({ title, children }) => (
  <div className="help-card">
    <div className="card-title">{title}</div>
    {children}
  </div>
);

interface IHelpSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

const HelpSection: React.FC<IHelpSectionProps> = ({ id, title, children }) => (
  <div id={id} className="help-section">
    <div className="section-title">{title}</div>
    {children}
  </div>
);

const Help: React.FC = () => {
  return (
    <div className="help">
      <div className="help-header">
        <h2>Monopoly Money Help</h2>
        <p>A small guide to Monopoly Money.</p>
      </div>

      <div className="help-nav">
        <a href="#pages" className="help-nav-btn">
          Pages
        </a>
        <a href="#player-help" className="help-nav-btn">
          Player Help
        </a>
        <a href="#banker-help" className="help-nav-btn">
          Banker Help
        </a>
      </div>

      <HelpSection id="pages" title="Pages">
        <img src={PagesImage} alt="Titles for each page" className="help-image" />
      </HelpSection>

      <HelpSection id="player-help" title="Player Help">
        <HelpCard title="Joining a Game">
          <p>
            To join a game, select &quot;Join Game&quot; from the home page and then enter the game
            id (the banker will have this) and your name. Press &quot;Join&quot; when you have filled
            out all the fields.
          </p>
        </HelpCard>

        <HelpCard title="Transferring Funds">
          <p>
            To transfer funds to another person/entity, click the tile associated with the target
            player/entity on the funds page. A dialog should appear which will allow you to input an
            amount to transfer. Press &quot;Send&quot; to complete the transaction.
          </p>
        </HelpCard>

        <HelpCard title="Viewing Previous Transactions">
          <p>
            Monopoly Money allows you to view all events including transactions that have previously
            occurred in the game. Go to the history page to view these events.
          </p>
        </HelpCard>
      </HelpSection>

      <HelpSection id="banker-help" title="Banker Help">
        <HelpCard title="Creating a Game">
          <p>
            To create a game, select &quot;New Game&quot; from the home page, enter your name (this
            will be your player name) and press &quot;Create&quot;.
          </p>
        </HelpCard>

        <HelpCard title="Initialising Player Balances">
          <p>
            Initialising a game sets everyone&apos;s balance to an initial value in one action; this
            option is only available if no transaction has been made yet.
          </p>
        </HelpCard>

        <HelpCard title="Giving Money to Players from the Bank">
          <p>
            On the bank page under the &quot;Give Money To Player&quot; label is a form to give money
            to players. Provide the amount and then select a target player from the dropdown.
            Pressing send will complete the transaction.
          </p>
        </HelpCard>

        <HelpCard title="Moving Money from Players to the Bank">
          <p>
            You can also do the opposite using the form under &quot;Take Money From Player&quot;; move
            money from a player to the bank. This is typically not a required action but is provided
            in the case that the banker accidentally gives too much money to a player.
          </p>
        </HelpCard>

        <HelpCard title="Players Passing GO">
          <p>
            Instead of repeatedly inputting the passing GO reward, a dropdown is displayed on the
            bank page. Selecting a player and then pressing &quot;Give&quot; will give the player the
            amount displayed above. To change the amount, go to the settings page.
          </p>
        </HelpCard>

        <HelpCard title="Giving Free Parking to a Player">
          <p>
            To give free parking to a player, select the player in the dropdown under the &quot;Give
            Free Parking&quot; label and press &quot;Give&quot; to complete the transaction.
          </p>
        </HelpCard>

        <HelpCard title="Changing a Player's Name">
          <p>
            You can change a player&apos;s name on the settings page by clicking the pencil button in
            the same row as the target player. Modifying the name and clicking &quot;Rename&quot; will
            rename the player.
          </p>
        </HelpCard>

        <HelpCard title="Removing a Player">
          <p>
            You can remove a player from the game on the settings page by clicking the trash button
            in the same row as the target player. Confirming this action will remove the player from
            the current game.
          </p>
        </HelpCard>

        <HelpCard title="Closing the Game to New Players">
          <p>
            Closing the game stops new players from joining and hides the game code from the funds
            page. To do this, select &quot;Close Game To New Players&quot; on the settings page. To
            re-open the game, press the same button again.
          </p>
        </HelpCard>

        <HelpCard title="Ending the Game">
          <p>
            You can end the game by clicking &quot;End Game&quot; on the setting page and confirming.
            This will fully delete the game and kick everyone. You cannot go back into a game after
            ending it.
          </p>
        </HelpCard>
      </HelpSection>
    </div>
  );
};

export default Help;
